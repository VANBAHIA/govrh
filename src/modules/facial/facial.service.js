const path = require('path')
const Jimp = require('jimp')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-backend-cpu')
require('@tensorflow/tfjs-backend-webgl')
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js')

let modelosCarregados = false

// FIX 1: Tratamento de erro adequado em carregarModelos()
async function carregarModelos() {
  if (modelosCarregados) return

  const modelPath = path.join(__dirname, '../../../public/models')

  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)

    modelosCarregados = true
    console.log('✅ Modelos faciais carregados')
  } catch (err) {
    modelosCarregados = false
    console.error('❌ Falha ao carregar modelos faciais:', err.message)
    throw new Error(`Não foi possível carregar os modelos de reconhecimento facial. Verifique se os arquivos existem em "${modelPath}". Detalhe: ${err.message}`)
  }
}

/**
 * Converte buffer de imagem em tensor compatível com face-api
 */
// FIX 5: Validação robusta de canais de pixels (RGBA → RGB)
async function bufferParaTensor(imageBuffer) {
  const imagem = await Jimp.read(imageBuffer)
  const { width, height } = imagem.bitmap

  imagem.background(0xFFFFFFFF)

  // bitmap.data sempre tem 4 canais (RGBA) no Jimp — garantimos extração correta
  const bitmapData = imagem.bitmap.data
  const expectedLength = width * height * 4

  if (bitmapData.length !== expectedLength) {
    throw new Error(
      `Dados de pixel inesperados: esperado ${expectedLength} bytes (${width}x${height}x4), recebido ${bitmapData.length}.`
    )
  }

  const pixels = new Uint8Array(width * height * 3)
  let idx = 0

  for (let offset = 0; offset < bitmapData.length; offset += 4) {
    pixels[idx++] = bitmapData[offset]     // R
    pixels[idx++] = bitmapData[offset + 1] // G
    pixels[idx++] = bitmapData[offset + 2] // B
    // offset + 3 = Alpha, ignorado intencionalmente
  }

  return tf.tensor3d(pixels, [height, width, 3])
}

/**
 * Extrai embedding facial de um buffer de imagem
 * Retorna array de 128 floats ou null se nenhum rosto detectado
 */
async function extrairEmbedding(imageBuffer) {
  await carregarModelos()

  const tensor = await bufferParaTensor(imageBuffer)

  try {
    const deteccao = await faceapi
      .detectSingleFace(tensor)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!deteccao) return null

    return Array.from(deteccao.descriptor)
  } finally {
    tensor.dispose()
  }
}

/**
 * Distância euclidiana entre dois embeddings
 * < 0.45 = mesmo rosto (threshold recomendado)
 */
function calcularDistancia(emb1, emb2) {
  return Math.sqrt(
    emb1.reduce((sum, val, i) => sum + Math.pow(val - emb2[i], 2), 0)
  )
}

/**
 * Compara embedding com todos do tenant e retorna o mais próximo
 */
function identificarNaBiometrias(embeddingFrame, biometrias, threshold = 0.45) {
  let melhor = null
  let menorDistancia = Infinity

  for (const bio of biometrias) {
    const distancia = calcularDistancia(embeddingFrame, bio.embedding)
    if (distancia < menorDistancia) {
      menorDistancia = distancia
      melhor = bio
    }
  }

  if (menorDistancia <= threshold) {
    return { biometria: melhor, distancia: menorDistancia }
  }

  return null
}

module.exports = { extrairEmbedding, calcularDistancia, identificarNaBiometrias }


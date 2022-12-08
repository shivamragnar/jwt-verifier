const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const axios = require("axios")

const region = 'ap-south-1'

// Gets ClientID & PoolId
const getAppInfo = async () => {
  const result = await axios('https://app.avniproject.org/cognito-details')
  return { ...result.data }
}

// Gets Public key for the PoolId
const getPublicKey = async userPoolId => {
  const keyInfo = await axios(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`)
  return { ...keyInfo.data }
}

// Verification wrapper function return result
const verifyJWT = async (token, keys) => {
  const header = getTokenHeader(token)
  const jwk = await getJWK(header.kid, keys)
  const result = await verifyJWTSignature(token, jwk)
  return result
}

// Gets token header
const getTokenHeader = (token) => {
    const [headerEncoded] = token.split('.')
    const buff = new Buffer.from(headerEncoded, 'base64')
    const text = buff.toString('ascii')
    return JSON.parse(text)
}

// Identifies JSON web key for the token
const getJWK = (kid, keys) => {
  for (let jwk of keys) {
    if (jwk.kid === kid) {
      return jwk
    }
  }
  return null
}

// Verifies the jwt signature using jsonwebtoken
const verifyJWTSignature = async (token, jwk) => {
  const pem = jwkToPem(jwk)
  return jwt.verify(token, pem, {algorithms: ['RS256']})
}

module.exports = {
  getAppInfo,
  getPublicKey,
  verifyJWT
}
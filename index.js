const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const { getAppInfo, getPublicKey, verifyJWT } = require('./utils')
const app = express()

// Listen for /ping route
app.get('/ping', async (req, res) => {
  const appInfo = await getAppInfo()
  const { poolId } = appInfo

  // Get web keys for the token using AWS URL
  const keyInfo = await getPublicKey(poolId)
  const { keys } = keyInfo

  // Get token from the request 
  const token = process.env.TOKEN // for now use hardcoded one

  if (!token) {
    return res.status(403).send("Token is required for verification")
  }
  try {
    // Verify token with the web keys using jsonwebtoken lib
    const result = await verifyJWT(token, keys)
    console.log('VERIFIED', result)
    res.status(200).send("pong")
  } catch (err) {
    console.log(err.message)
    return res.status(403).send()
  }
})

// Start server on PORT 3000
app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

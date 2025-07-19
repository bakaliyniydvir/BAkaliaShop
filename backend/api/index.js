const serverless = require('serverless-http')
const app = require('./src/server.js')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))

module.exports = app
module.exports.handler = serverless(app)

const app = require('./app');
const logger = require('./src/utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));


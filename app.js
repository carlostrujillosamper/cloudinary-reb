require('dotenv').config();

const express      = require('express');
const path         = require('path');


const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();



const cloudRoutes = require('./routes/cloudinary.routes')
app.use('/cloudinary', cloudRoutes)


module.exports = app;

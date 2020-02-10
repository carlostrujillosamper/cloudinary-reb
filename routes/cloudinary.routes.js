const express = require('express');
const router  = express.Router();
const cloudinary = require('../configs/cloudinary.config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {convertArrayToCSV} = require('convert-array-to-csv');

const filename = path.join(__dirname, 'allImages.csv')

let output = [] 

router.get('/statistics',(req,res)=>{
  let statistics = {totalImages:'',formats :{jpg:0,png:0,svg:0,gif:0},biggestPicture:'',smallestPicture:'',avgSize:''}
  let allImages = []
  const getStatistics = (nextPage) => {
    console.log('hola')
    cloudinary.v2.api.resources({max_results: 500 , next_cursor : nextPage})
    .then(images=>{
      allImages.push(...images.resources)
      if(!images.next_cursor){
         statistics.totalImages = allImages.length
         allImages.forEach(image=>++statistics.formats[image.format])
        let maxSize = allImages.reduce((prev, current) => (prev.bytes > current.bytes) ? prev : current,1)
        statistics.biggestPicture = maxSize.url
        let minSize = allImages.reduce((prev, current) => (prev.bytes < current.bytes) ? prev : current,1)
        statistics.smallestPicture = minSize.url
        statistics.avgSize = Math.floor(allImages.reduce((total,current)=>total + current.bytes,0)/allImages.length)
        res.json(statistics)
        return console.log(statistics)
      }
      else{getStatistics(images.next_cursor)}
    })
    .catch(err=>console.log(err))
  }

  getStatistics()
})

router.get("/csv", (req, res) => {
let allImagesDetailed = []
const getCsv = (nextPage) => {
  cloudinary.v2.search
  .expression('')
  .max_results(500)
  .next_cursor(nextPage)
  .execute()
  .then(imagesDetailed=>{
    allImagesDetailed.push(...imagesDetailed.resources)
    if(!imagesDetailed.next_cursor){
      allImagesDetailed.forEach((image , idx) => {
        let row = []
        if(idx==0)Object.keys(image).forEach(key=>row.push(key))
        Object.keys(image).forEach((key)=>{
          typeof(image[key]) === 'object' && image[key] !== null ? null : row.push(image[key])
        // row.push(image[key])
        })
        output.push(row.join())
    })
    // let csvFromArrayOfArrays = convertArrayToCSV(allImagesDetailed);
    console.log('Csv file written')
    return fs.writeFileSync(filename, output.join(os.EOL));
    // console.log(allImagesDetailed)
    // return fs.writeFileSync(filename, csvFromArrayOfArrays, 'utf8');
    }
    else{
      getCsv(imagesDetailed.next_cursor)
    }
})
.catch(err=>console.log(err))
}
getCsv()
})







module.exports = router;
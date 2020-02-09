const express = require('express');
const router  = express.Router();
const cloudinary = require('../configs/cloudinary.config');
const fs = require('fs');
const path = require('path');
const os = require('os');

const filename = path.join(__dirname, 'allImages.csv');
const output = []; 

router.get('/statistics',(req,res)=>{
  let statistics = {totalImages:'',formats :{jpg:0,png:0,svg:0},biggestPicture:'',smallestPicture:'',avgSize:''}
  let allImages = []
  const getStatistics = (nextPage) => {
    cloudinary.v2.api.resources({max_results: 500 , next_cursor : nextPage})
    .then(images=>{
      allImages.push(...images.resources)
      if(!images.next_cursor){
         statistics.totalImages = allImages.length
        let maxSize = allImages.reduce((prev, current) => (prev.bytes > current.bytes) ? prev : current,1)
        statistics.biggestPicture = maxSize.url
        let minSize = allImages.reduce((prev, current) => (prev.bytes < current.bytes) ? prev : current,1)
        statistics.smallestPicture = minSize.url
        statistics.avgSize = Math.floor(allImages.reduce((total,current)=>total + current.bytes,0)/allImages.length)
        allImages.forEach(image => {
          if(image.format == 'jpg'){
            ++statistics.formats.jpg
          }
          if(image.format == 'png' ){
            ++statistics.formats.png
          }
          if(image.format == 'svg' ){
            ++statistics.formats.svg
          }
        });
        res.json(allImages)
        return console.log(statistics)
    
      }
      else{getStatistics(images.next_cursor)}
    })
    .catch(err=>console.log(err))
  }

  getStatistics()
})

router.get("/csv", (req, res) => {
let sumResourcesArray = []
const getCsv = (nextPage) => {
  cloudinary.v2.search
  .expression('')
  .max_results(500)
  .next_cursor(nextPage)
  .execute()
  .then(allImagesDetailed=>{
    sumResourcesArray.push(...allImagesDetailed.resources)
    if(!allImagesDetailed.next_cursor){
      sumResourcesArray.forEach((image) => {
        const row = []
        Object.keys(image).forEach((key)=>{
        row.push(image[key]);
        })
        output.push(row.join())
    })
    return fs.writeFileSync(filename, output.join(os.EOL));
  
    }
    else{
      console.log(allImagesDetailed.next_cursor)
      getCsv(allImagesDetailed.next_cursor)
    }
})
.catch(err=>console.log(err))
}
getCsv()
})







module.exports = router;
const express = require('express');
const router  = express.Router();
const cloudinary = require('../configs/cloudinary.config');

router.get('/statistics',(req,res)=>{
  let statistics = {totalImages:'',formats :{jpg:0,png:0,svg:0},biggestPicture:'',smallestPicture:'',avgSize:''}
  cloudinary.v2.api.resources()
  .then(allImages=>{
    statistics.totalImages = allImages.resources.length
    let maxSize = allImages.resources.reduce((prev, current) => (prev.bytes > current.bytes) ? prev : current,1)
    statistics.biggestPicture = maxSize.url
    let minSize = allImages.resources.reduce((prev, current) => (prev.bytes < current.bytes) ? prev : current,1)
    statistics.smallestPicture = minSize.url
    statistics.avgSize = Math.floor(allImages.resources.reduce((total,current)=>total + current.bytes,0)/allImages.resources.length)
    allImages.resources.forEach(image => {
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
    res.json(statistics)
    console.log(statistics)
    

  })
  .catch(err=>console.log(err))
})








module.exports = router;
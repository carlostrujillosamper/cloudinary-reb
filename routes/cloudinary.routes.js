const express = require("express");
const router = express.Router();
const cloudinary = require("../configs/cloudinary.config");
const { convertArrayToCSV } = require("convert-array-to-csv");


router.get("/statistics", (req, res) => {
  let statistics = {
    totalImages: "",
    formats: {},
    biggestPicture: "",
    smallestPicture: "",
    avgSize: ""
  };
  let allImages = [];
  const getStatistics = nextPage => {
    cloudinary.v2.api
      .resources({ max_results: 500, next_cursor: nextPage })
      .then(images => {
        allImages.push(...images.resources);
        if (!images.next_cursor) {
          statistics.totalImages = allImages.length;
          allImages.forEach(image =>
            statistics.formats[image.format] == undefined
              ? (statistics.formats[image.format] = 1)
              : ++statistics.formats[image.format]
          );
          let maxSize = allImages.reduce(
            (prev, current) => (prev.bytes > current.bytes ? prev : current),
            1
          );
          statistics.biggestPicture = maxSize.url;
          let minSize = allImages.reduce(
            (prev, current) => (prev.bytes < current.bytes ? prev : current),
            1
          );
          statistics.smallestPicture = minSize.url;
          statistics.avgSize = Math.floor(
            allImages.reduce((total, current) => total + current.bytes, 0) /
              allImages.length
          );
          console.log(statistics);
          res.json(statistics);
        } else {
          getStatistics(images.next_cursor);
        }
      })
      .catch(err => console.log(err));
  };

  getStatistics();
});

router.get("/csv", (req, res) => {
  let allImagesDetailed = [];
  const getCsv = nextPage => {
    cloudinary.v2.search
      .expression("")
      .max_results(500)
      .next_cursor(nextPage)
      .execute()
      .then(imagesDetailed => {
        allImagesDetailed.push(...imagesDetailed.resources);
        if (!imagesDetailed.next_cursor) {
          let allImagesDetailedFixed = allImagesDetailed.map(imagesDetailed => {
            Object.keys(imagesDetailed).forEach(key => {
              if (
                typeof imagesDetailed[key] == "object" &&
                imagesDetailed[key] != null
              ) {
                imagesDetailed[key] = JSON.stringify(
                  imagesDetailed[key]
                ).replace(/[{}"]/g, "");
              }
            });
            return { ...imagesDetailed };
          });
          let csvFromArrayOfArrays = convertArrayToCSV(allImagesDetailedFixed);
          res.attachment("allImages.csv");
          res.send(Buffer.from(csvFromArrayOfArrays));
          console.log("CSV file created");
        } else {
          getCsv(imagesDetailed.next_cursor);
        }
      })
      .catch(err => console.log(err));
  };
  getCsv();
});







module.exports = router;
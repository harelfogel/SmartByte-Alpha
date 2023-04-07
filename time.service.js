function getCurrentSeasonAndHour() {
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
  
    let season;
    if (month >= 2 && month <= 4) {
      season = 'spring';
    } else if (month >= 5 && month <= 7) {
      season = 'summer';
    } else if (month >= 8 && month <= 10) {
      season = 'fall';
    } else {
      season = 'winter';
    }
  
    return { season, hour };
  }

module.exports={
    getCurrentSeasonAndHour
}
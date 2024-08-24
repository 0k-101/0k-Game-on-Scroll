export default function TableCard ( {cardId} ) {

    const colorStrId = cardId % 53;
    const colorStr = 
        cardId === 200 ? 'back-turned' :  
        colorStrId === 0 ? 'joker'  : 
        colorStrId <= 13 ? 'gri'    :
        colorStrId <= 26 ? 'mavi'   :
        colorStrId <= 39 ? 'pembe'  : 'turuncu'
    
    
    const cardImg = require(`../assets/cards/${colorStr}${colorStr === `back-turned` || colorStr === `joker` ?  `` : cardId % 13 === 0 ? 13 : cardId % 13}.png`);
    return (
        <img src={cardImg} alt={cardId} />
    );
}
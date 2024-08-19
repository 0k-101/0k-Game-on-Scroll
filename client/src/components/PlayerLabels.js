export default function PlayerLabels({currentPlayerId,whoseTurn}){
    
    return (
        <div className="label-container">
            <h3 className={`player-label label-bot` + (currentPlayerId === whoseTurn ? ` label-turn` :``)}>
                player-{currentPlayerId}</h3>
            <h3 className={`player-label label-right`+ ((currentPlayerId+1)%4 === whoseTurn ? ` label-turn` :``)}>
                player-{(currentPlayerId+1)%4} </h3>
            <h3 className={`player-label label-top`+ ((currentPlayerId+2)%4 === whoseTurn ? ` label-turn` :``)}>
                player-{(currentPlayerId+2)%4} </h3>
            <h3 className={`player-label label-left`+ ((currentPlayerId+3)%4 === whoseTurn ? ` label-turn` :``)}>
                player-{(currentPlayerId+3)%4} </h3>
        </div>
    )
}
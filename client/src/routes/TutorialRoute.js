const Images = [
  require('../assets/tutorial/1.png'),
  require('../assets/tutorial/2.png'),
  require('../assets/tutorial/3.png'),
  require('../assets/tutorial/4.png'),
  require('../assets/tutorial/5.png'),
  require('../assets/tutorial/6.png'),
  require('../assets/tutorial/7.png'),
  require('../assets/tutorial/8.jpg'),
  require('../assets/tutorial/9.png'),
]

const TutorialPage = () => {
  return (
    <>
    <div className='tutorial-page-bg'></div>
    <div className="tutorial-page-container p-5 text-baseline">
        <h1 className="text-center">0K Game Tutorial</h1>

      <section className="mt-4">
        <h2>Game Rules</h2>
        <h3>Objective</h3>
        <p>
          The goal in 0K is to finish the game with the lowest score or by
          completing your hand first. Players score points based on the value
          of the tiles left in their hand at the end of a round. The player with
          the lowest total score across all rounds wins the game. The game can
          end when the draw pile is exhausted or when a player completes their
          hand.
        </p>

        <h3>Starting the Game</h3>
        <p>
          The game begins with one player designated as the dealer who
          distributes 21 tiles to each player with the player to their right
          receiving 22 tiles (This process is automatic). The remaining tiles
          are placed in the center of the table face down. The player with 22
          tiles starts the game by discarding one tile without drawing.
        </p>

        <h3>Gameplay</h3>
        <h4>Drawing and Discarding</h4>

        <p>
          On your turn, you may either draw a tile from the draw pile or take
          the tile that the player before you just discarded. After drawing, if
          your hand contains pers that total at least 101 points, you may lay
          them down. This is called opening your hand. Otherwise, you must
          discard a tile to end your turn.
        </p>
        <img src={Images[0]} alt="Per Calculation Example" className="img-fluid" style={{width:'50%'}}/>

        <h4>Pers</h4>
        <p>
          Pers are 3 or more numbered tile combinations that have some point
          value. To lay down your hand, you need to form valid sets of pers.
          These pers can either be:
        </p>
        <ul>
          <li>
            <strong>Sets:</strong> Three or more tiles of the same number in
            different colors (e.g., a green 8, an orange 8, and a blue 8).
          </li>
        <img src={Images[1]} alt="Joker Example" className="img-fluid" />

          <li>
            <strong>Runs:</strong> Three or more consecutive numbers of the same
            color (e.g., an orange 4, 5, 6, 7, 8).
          </li>
        <img src={Images[2]} alt="Fake Joker Example" className="img-fluid" />

        </ul>

        <h4>Calculating Your Current Points and Opening Your Hand</h4>
        <p>
          We calculate your per count and total points automatically. Points are
          calculated using this formula: In a three-tile per, each number of
          tiles is added up. For example: 8 + 8 + 8 = 15. 15 is the total points
          of this per.
        </p>
        <img src={Images[3]} alt="Fake Joker Example" className="img-fluid" />

        <h4>Joker (Okey Tile)</h4>
        <p>
          Jokers can be used to substitute any tile in a set or run. It is the
          tile that is +1 of the tile in Okey area. 
          </p> 
        <img src={Images[4]} alt="Fake Joker Example" className="img-fluid" />
          
          <p>For example, in this game,
          the joker is gray 4. Down below is a per that is created with the
          joker tile blue 12.
        </p>
        <img src={Images[5]} alt="Fake Joker Example" className="img-fluid" />

        <h4>Fake Joker</h4>
        <p>
          Fake joker can be used as the joker’s actual number. For example, if
          the joker is 12 blue, you can use the fake joker as blue 12, and the
          below per would be valid.
        </p>
      </section>

      <img src={Images[6]} alt="Fake Joker Example" className="img-fluid" />
      <section className="mt-4">

        <h2>Opening Your Hand</h2>
        <p>
          Your total points equal the total points of all pers. If your points
          are greater than 101, you can open your hand. Opening your hand means
          laying the valid pers on your board in the center of the game. After
          opening your hand, the pers you used are not considered in the
          calculation of your score, which means opening your hand is one of the
          best ways to collect the least amount of points.
        </p>
        <p>
          You can keep laying pers after opening your hand. This will bring you
          closer to completing the game.
        </p>
      </section>

      <img src={Images[7]} alt="Fake Joker Example" className="img-fluid" style={{width:'50%'}}/>
      <section className="mt-4">

        <h2>Completing</h2>
        <p>
          Completing means a player has no tiles left to play with. This is
          achieved by laying all pers in the center and discarding the last tile
          left. You need to have 7 pers laid up in the center in order to
          complete.
        </p>
      </section>

      <section className="mt-4">
        <h2>Scoring</h2>
        <h3>End-of-Game Scoring</h3>
        <p>
          If the draw pile is exhausted before anyone finishes their hand, all
          players score the sum of the tiles left in their hand. If a player
          completes their hand, which means running out of tiles on their board,
          they score -101 points, and other players score based on the remaining
          tiles.
        </p>
        <p>The main goal is to have the least score at the end of 4 rounds.</p>
      </section>
      <img src={Images[8]} alt="Fake Joker Example" className="img-fluid" style={{width:'50%'}} />

      <section className="mt-4">
        <h2>Tips and Strategies</h2>
        <ul>
          <li>
            <strong>Observe the Discards:</strong> Keep track of the tiles other
            players discard. This can provide insight into their strategies and
            which tiles might still be in play.
          </li>
          <li>
            <strong>Prioritize Low Scores:</strong> Since the player with the
            lowest score wins, focus on minimizing the value of the tiles in
            your hand.
          </li>
          <li>
            <strong>Joker Utilization:</strong> Jokers can be game-changers,
            allowing you to complete sets or runs more easily. Use them wisely
            to maximize your chances of winning.
          </li>
        </ul>
      </section>
    </div>
    </>
  );
};

export default TutorialPage;

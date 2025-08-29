import { useEffect, useState } from "react";

import happy1 from "./assets/happy.png";
import happy2 from "./assets/happy_2.png";
import happy3 from "./assets/happy_3.png";
import sad1 from "./assets/sad_1.png";
import sad2 from "./assets/sad_2.png";
import sad3 from "./assets/sad_3.png";
import sad4 from "./assets/sad_4.png";
import sad5 from "./assets/sad_5.png";
import dead1 from "./assets/dead_1.png";
import dead2 from "./assets/dead_2.png";
import dead3 from "./assets/dead_3.png";
import dead4 from "./assets/dead_4.png";
import dead5 from "./assets/dead_5.png";
import normal from "./assets/norm_1.png";
import normal2 from "./assets/norm_2.png";
import normal3 from "./assets/norm_3.png";
import normal4 from "./assets/norm_4.png";
import sadder1 from "./assets/med_1.png";
import sadder2 from "./assets/med_2.png";
import sadder3 from "./assets/med_3.png";
import sadder4 from "./assets/med_4.png";
import deadest from "./assets/deadest.png";

const animations = {
  happy: [happy1, happy2, happy3],
  normal: [happy3, happy1, normal3, normal4],
  normal_1: [normal, normal2, happy1, happy2],
  normal_2: [sad1, sad4, normal, happy2, sad1],
  sad_1: [sad1, sad2, sad3, sad4, sad5],
  sad_2: [sad1, sadder1, sad2, sadder3],
  sad_3: [sadder1, sadder2, sadder3, sadder4],
  medium: [normal2, sadder4, sadder3, sad4],
  close: [dead1, dead2, dead3, dead4, dead5],
  closer: [sadder1, sadder2, dead3, dead4],
  dead: [sadder1, sadder2, sadder1, sadder2, deadest],
};

function Pet({ health }) {
  const [frame, setFrame] = useState(0);
  const [currentAnim, setCurrentAnim] = useState("normal");

  // Choose animation by health
  useEffect(() => {
    if (health === 0) {
      setCurrentAnim("dead");
    } else if (health >= 1 && health <= 9) {
      setCurrentAnim("closer");
    } else if (health >= 10 && health <= 19) {
      setCurrentAnim("close");
    } else if (health >= 20 && health <= 29) {
      setCurrentAnim("medium");
    } else if (health >= 30 && health <= 39) {
      setCurrentAnim("sad_3");
    } else if (health >= 40 && health <= 49) {
      setCurrentAnim("sad_2");
    } else if (health >= 50 && health <= 59) {
      setCurrentAnim("sad_1");
    } else if (health >= 60 && health <= 69) {
      setCurrentAnim("normal_2");
    } else if (health >= 70 && health <= 79) {
      setCurrentAnim("normal_1");
    } else if (health >= 80 && health <= 89) {
      setCurrentAnim("normal");
    } else if (health >= 90 && health <= 99) {
      setCurrentAnim("happy");
    }
  }, [health]);

  // Cycle frames continuously
  useEffect(() => {
    const frames = animations[currentAnim];
    const intervalId = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 600); 

    return () => clearInterval(intervalId);
  }, [currentAnim]);

  return (
    <div style={{ marginTop: "5rem", textAlign: "center", marginBottom: "5rem" }}>
      <img
        src={animations[currentAnim][frame]}
        alt={`${currentAnim} pet`}
        style={{ width: "120px", imageRendering: "pixelated" }}
      />
    </div>
  );
}

export default Pet;
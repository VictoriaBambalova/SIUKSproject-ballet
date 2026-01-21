/* global TWEEN, radians */

window.addEventListener("load", () => {
  const scene = window.scene;
  if (!scene) {
    console.error("No <suica id='scene'> found.");
    return;
  }

  const leftLeg = window.leftLeg;
  const rightLeg = window.rightLeg;
  const lFoot = window.lFoot;
  const rFoot = window.rFoot;
  const leftArm = window.leftArm;
  const rightArm = window.rightArm;

  if (!leftLeg || !rightLeg || !lFoot || !rFoot) {
    console.error("Ballerina parts not found. Check ids in HTML.");
    return;
  }

  const poses = {
    1: {
      name: "I",
      desc: "Heels together, turnout.",
      dist: 0.0,
      turnout: 45,
      front: 0.0,
    },
    2: {
      name: "II",
      desc: "Feet apart, turnout.",
      dist: 1.0,
      turnout: 45,
      front: 0.0,
    },
    3: {
      name: "III",
      desc: "One foot in front.",
      dist: 0.1,
      turnout: 45,
      front: 0.6,
    },
    4: {
      name: "IV",
      desc: "Separated front position.",
      dist: 0.4,
      turnout: 45,
      front: 0.9,
    },
    5: {
      name: "V",
      desc: "Feet crossed tightly.",
      dist: 0.0,
      turnout: 55,
      front: 0.8,
    },
    6: {
      name: "VI",
      desc: "Parallel feet.",
      dist: 0.3,
      turnout: 0,
      front: 0.0,
    },
  };

  const current = { ...poses[1] };

  function applyPose(p) {
    const a = radians(p.turnout);
    const half = p.dist / 2;

    leftLeg.center = [-0.25 - half, 0.9, p.front * 0.5];
    rightLeg.center = [0.25 + half, 0.9, -p.front * 0.5];

    leftLeg.spin = [a, 0, 0];
    rightLeg.spin = [-a, 0, 0];

    lFoot.spin = [a, 0, 0];
    rFoot.spin = [-a, 0, 0];

    if (p.name === "V") {
      leftLeg.center = [-0.1, 0.9, 0.42];
      rightLeg.center = [0.1, 0.9, -0.42];
    }

    if (leftArm && rightArm) {
      const lift = p.name === "V" ? 14 : p.name === "II" ? 6 : 0;
      leftArm.spin = [0, 0, radians(25 + lift)];
      rightArm.spin = [0, 0, radians(-(25 + lift))];
    }
  }

  applyPose(current);

  let tween = null;

  function goToPose(id) {
    const target = poses[id];
    if (!target) return;

    if (tween) tween.stop();

    tween = new TWEEN.Tween(current)
      .to(
        { dist: target.dist, turnout: target.turnout, front: target.front },
        900,
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => applyPose(current))
      .start();

    updateUI(target, id);
  }

  scene.ontime = () => {
    TWEEN.update();
  };

  const nameEl = document.getElementById("poseName");
  const descEl = document.getElementById("poseDesc");
  const buttons = document.querySelectorAll(".poseBar button");

  function updateUI(pose, id) {
    if (nameEl) nameEl.textContent = "Pose: " + pose.name;
    if (descEl) descEl.textContent = pose.desc;

    buttons.forEach((b) => b.removeAttribute("data-active"));
    const active = document.querySelector(`.poseBar button[data-pose="${id}"]`);
    if (active) active.setAttribute("data-active", "1");
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => goToPose(Number(btn.dataset.pose)));
  });

  updateUI(poses[1], 1);
});

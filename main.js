/* global TWEEN, group, sphere, cylinder, cone, cube, radians */

window.addEventListener("load", () => {
  const scene = window.scene;
  if (!scene) {
    console.error("No <suica id='scene'> found. Check index.html.");
    return;
  }

  // Camera setup
  scene.background("whitesmoke");
  scene.demo(6, 20, 0);

  // Build ballerina from primitives
  const ballerina = group();

  // Scale and position
  ballerina.size = 2.2;
  ballerina.center = [0, 0.2, 0];

  // Body
  const torso = cylinder([0, 2.2, 0], [0.7, 1.4, 0.7], "white");
  const head = sphere([0, 3.5, 0], 0.42, "mistyrose");
  const tutu = cone([0, 1.55, 0], [1.4, 0.8, 1.4], "pink");

  // Arms
  const leftArm = cylinder([-0.95, 2.35, 0], [0.14, 1.05, 0.14], "mistyrose");
  const rightArm = cylinder([0.95, 2.35, 0], [0.14, 1.05, 0.14], "mistyrose");

  leftArm.spin = [0, 0, radians(25)];
  rightArm.spin = [0, 0, radians(-25)];

  // Legs
  const leftLeg = group();
  const rightLeg = group();

  const lThigh = cylinder([0, 0.9, 0], [0.2, 1.0, 0.2], "gainsboro");
  const lShin = cylinder([0, 0.1, 0], [0.16, 0.8, 0.16], "gainsboro");
  const lFoot = cube([0, -0.3, 0.3], [0.55, 0.15, 1.05], "linen");

  const rThigh = cylinder([0, 0.9, 0], [0.2, 1.0, 0.2], "gainsboro");
  const rShin = cylinder([0, 0.1, 0], [0.16, 0.8, 0.16], "gainsboro");
  const rFoot = cube([0, -0.3, 0.3], [0.55, 0.15, 1.05], "linen");

  leftLeg.add(lThigh, lShin, lFoot);
  rightLeg.add(rThigh, rShin, rFoot);

  ballerina.add(torso, head, tutu, leftArm, rightArm, leftLeg, rightLeg);

  leftLeg.center = [-0.25, 0.9, 0];
  rightLeg.center = [0.25, 0.9, 0];

  // Poses
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
      desc: "One foot in front (near).",
      dist: 0.1,
      turnout: 45,
      front: 0.6,
    },
    4: {
      name: "IV",
      desc: "One foot in front (apart).",
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

    const lift = p.name === "V" ? 14 : p.name === "II" ? 6 : 0;
    leftArm.spin = [0, 0, radians(25 + lift)];
    rightArm.spin = [0, 0, radians(-(25 + lift))];
  }

  applyPose(current);

  // Tween transition
  let tween = null;

  function goToPose(id) {
    const target = poses[id];
    if (!target) return;

    if (tween) tween.stop();

    tween = new TWEEN.Tween(current)
      .to(
        {
          dist: target.dist,
          turnout: target.turnout,
          front: target.front,
        },
        900,
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => applyPose(current))
      .start();

    updateUI(target, id);
  }

  // Rotation with drag
  let dragging = false;
  let lastX = 0;

  scene.onpointerdown = (e) => {
    dragging = true;
    lastX = e.clientX;
  };

  scene.onpointerup = () => {
    dragging = false;
  };

  scene.onpointermove = (e) => {
    if (!dragging) return;

    const dx = e.clientX - lastX;
    const old = ballerina.spin || [0, 0, 0];

    ballerina.spin = [old[0] + dx * 0.01, old[1], old[2]];

    lastX = e.clientX;
  };

  scene.ontime = () => {
    TWEEN.update();
  };

  // UI
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
    btn.addEventListener("click", () => {
      goToPose(Number(btn.dataset.pose));
    });
  });

  updateUI(poses[1], 1);
});

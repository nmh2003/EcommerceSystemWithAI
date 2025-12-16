// setup

//expression setup
var expressionyay = 0;
var expressionoof = 0;
var expressionlimityay = 0.5;
var expressionlimitoof = 0.5;
var expressionease = 100;
var expressionintensity = 0.75;

//interface values
if (localStorage.localvalues) {
  var initvalues = true;
  var mouththreshold = Number(localStorage.mouththreshold);
  var mouthboost = Number(localStorage.mouthboost);
  var bodythreshold = Number(localStorage.bodythreshold);
  var bodymotion = Number(localStorage.bodymotion);
  var expression = Number(localStorage.expression);
} else {
  var mouththreshold = 10;
  var mouthboost = 10;
  var bodythreshold = 10;
  var bodymotion = 10;
  var expression = 80;
}

// setup three-vrm

// renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: "low-power",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(
  30.0,
  window.innerWidth / window.innerHeight,
  0.1,
  20.0
);
camera.position.set(0.0, 1.45, 0.999);

// camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.45, 0.0);
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// lookat target
const lookAtTarget = new THREE.Object3D();
camera.add(lookAtTarget);

// gltf and vrm
let currentVrm = undefined;
const loader = new THREE.GLTFLoader();

function load(url) {
  loader.crossOrigin = "anonymous";
  loader.load(
    url,

    (gltf) => {
      THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

      THREE.VRM.from(gltf).then((vrm) => {
        if (currentVrm) {
          scene.remove(currentVrm.scene);
          currentVrm.dispose();
        }

        currentVrm = vrm;
        scene.add(vrm.scene);

        vrm.scene.position.y += 0.1;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Hips
        ).rotation.y = Math.PI;
        vrm.springBoneManager.reset();

        // un-T-pose
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightUpperArm
        ).rotation.z = 250;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightLowerArm
        ).rotation.z = -0.2;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.z = -250;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.z = 0.2;

        // randomise init positions
        function randomsomesuch() {
          return (Math.random() - 0.5) / 10;
        }

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.x = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.y = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Head
        ).rotation.z = randomsomesuch();

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.x = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.y = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Neck
        ).rotation.z = randomsomesuch();

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Spine
        ).rotation.x = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Spine
        ).rotation.y = randomsomesuch();
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.Spine
        ).rotation.z = randomsomesuch();

        vrm.lookAt.target = lookAtTarget;
        vrm.springBoneManager.reset();

        console.log(vrm);
      });
    },

    (progress) =>
      console.log(
        "Loading model...",
        100.0 * (progress.loaded / progress.total),
        "%"
      ),

    (error) => console.error(error)
  );
}

load("./saler.vrm");

// ==========================================
// TTS LIPS SYNC - Separate from microphone
// ==========================================
let ttsAudioContext = null;
let ttsAnalyser = null;
let ttsSource = null;
let isTTSSpeaking = false;
let ttsAnimationFrame = null;

// Function to start TTS lips sync
function startTTSLipsSync(audioBlob) {
  return new Promise((resolve, reject) => {
    try {
      // Stop any existing TTS
      if (ttsSource) {
        ttsSource.stop();
        ttsSource.disconnect();
      }
      if (ttsAnimationFrame) {
        cancelAnimationFrame(ttsAnimationFrame);
      }

      // Create audio context if not exists
      if (!ttsAudioContext) {
        ttsAudioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      // Resume context if suspended
      if (ttsAudioContext.state === "suspended") {
        ttsAudioContext.resume();
      }

      // Create analyzer
      if (!ttsAnalyser) {
        ttsAnalyser = ttsAudioContext.createAnalyser();
        ttsAnalyser.fftSize = 512; // Smaller FFT for better performance
        ttsAnalyser.smoothingTimeConstant = 0.7; // Smooth transitions
        ttsAnalyser.connect(ttsAudioContext.destination);
      }

      // Decode audio blob
      audioBlob
        .arrayBuffer()
        .then((arrayBuffer) => {
          ttsAudioContext.decodeAudioData(
            arrayBuffer,
            (buffer) => {
              // Create buffer source
              ttsSource = ttsAudioContext.createBufferSource();
              ttsSource.buffer = buffer;
              ttsSource.connect(ttsAnalyser);

              // Start playback
              ttsSource.start(0);
              isTTSSpeaking = true;

              // Start lips sync animation loop
              updateTTSLipsSync();

              // Handle audio end
              ttsSource.onended = () => {
                isTTSSpeaking = false;
                if (ttsAnimationFrame) {
                  cancelAnimationFrame(ttsAnimationFrame);
                }
                // Smoothly close mouth
                if (currentVrm) {
                  smoothCloseMouth();
                }
                resolve();
              };
            },
            (error) => {
              console.error("Error decoding audio:", error);
              reject(error);
            }
          );
        })
        .catch(reject);
    } catch (error) {
      console.error("Error starting TTS lips sync:", error);
      isTTSSpeaking = false;
      reject(error);
    }
  });
}

// Animation loop for TTS lips sync
function updateTTSLipsSync() {
  if (!isTTSSpeaking || !ttsAnalyser || !currentVrm) {
    return;
  }

  const bufferLength = ttsAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  ttsAnalyser.getByteFrequencyData(dataArray);

  // Analyze different frequency ranges for more natural lips sync
  const lowFreq = dataArray.slice(0, bufferLength / 4);
  const midFreq = dataArray.slice(bufferLength / 4, bufferLength / 2);
  const highFreq = dataArray.slice(bufferLength / 2, bufferLength);

  // Calculate average for each range
  const lowAvg = lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length;
  const midAvg = midFreq.reduce((a, b) => a + b, 0) / midFreq.length;
  const highAvg = highFreq.reduce((a, b) => a + b, 0) / highFreq.length;

  // Overall volume
  const totalAvg = (lowAvg + midAvg + highAvg) / 3;

  // Map to mouth shapes - more natural mapping
  // A sound (ah) - mouth wide open - for louder sounds
  const mouthA = Math.min(Math.max((totalAvg - 20) / 100, 0), 1) * 0.9;

  // I sound (ee) - for higher frequencies
  const mouthI = Math.min(Math.max((highAvg - 15) / 80, 0), 1) * 0.4;

  // O sound (oh) - for mid frequencies
  const mouthO = Math.min(Math.max((midAvg - 15) / 80, 0), 1) * 0.5;

  // Apply blend shapes
  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.A,
    mouthA
  );

  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.I,
    mouthI
  );

  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.O,
    mouthO
  );

  // Continue animation loop
  ttsAnimationFrame = requestAnimationFrame(updateTTSLipsSync);
}

// Smoothly close mouth when TTS ends
function smoothCloseMouth() {
  if (!currentVrm) return;

  let frame = 0;
  const totalFrames = 10; // 10 frames to close

  function closeStep() {
    if (frame >= totalFrames) return;

    const progress = frame / totalFrames;
    const ease = 1 - progress; // Linear easing, you can use easeOut for smoother

    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.A,
      currentVrm.blendShapeProxy.getValue(
        THREE.VRMSchema.BlendShapePresetName.A
      ) * ease
    );

    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.I,
      currentVrm.blendShapeProxy.getValue(
        THREE.VRMSchema.BlendShapePresetName.I
      ) * ease
    );

    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.O,
      currentVrm.blendShapeProxy.getValue(
        THREE.VRMSchema.BlendShapePresetName.O
      ) * ease
    );

    frame++;
    requestAnimationFrame(closeStep);
  }

  closeStep();
}

// ==========================================
// MAIN ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (currentVrm) {
    currentVrm.update(deltaTime);
    // TTS lips sync is handled in separate loop (updateTTSLipsSync)
    // No microphone lips sync here anymore
  }

  renderer.render(scene, camera);
}

animate();

// ==========================================
// MICROPHONE - Only for body movement, NOT lips sync
// ==========================================
navigator.mediaDevices
  .getUserMedia({
    audio: true,
  })
  .then(
    function (stream) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

      analyser.smoothingTimeConstant = 0.5;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = function () {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;

        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += array[i];
        }

        const average = values / length;
        const inputvolume = average;

        document.getElementById("inputlevel").value = inputvolume;

        if (currentVrm != undefined) {
          // REMOVED: Microphone-based lips sync
          // Only keep body movement based on mic input

          // Move body based on mic input
          const damping = 750 / (bodymotion / 10);
          const springback = 1.001;

          if (average > 1 * bodythreshold) {
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z /= springback;
          }

          // Expression drift
          expressionyay += (Math.random() - 0.5) / expressionease;
          if (expressionyay > expressionlimityay) {
            expressionyay = expressionlimityay;
          }
          if (expressionyay < 0) {
            expressionyay = 0;
          }
          currentVrm.blendShapeProxy.setValue(
            THREE.VRMSchema.BlendShapePresetName.Fun,
            expressionyay
          );
          expressionoof += (Math.random() - 0.5) / expressionease;
          if (expressionoof > expressionlimitoof) {
            expressionoof = expressionlimitoof;
          }
          if (expressionoof < 0) {
            expressionoof = 0;
          }
          currentVrm.blendShapeProxy.setValue(
            THREE.VRMSchema.BlendShapePresetName.Angry,
            expressionoof
          );
        }

        lookAtTarget.position.x = camera.position.x;
        lookAtTarget.position.y =
          (camera.position.y - camera.position.y - camera.position.y) / 2 + 0.5;
      };
    },
    function (err) {
      console.log("The following error occured: " + err.name);
    }
  );

// Blink
function blink() {
  const blinktimeout = Math.floor(Math.random() * 250) + 50;
  lookAtTarget.position.y = camera.position.y - camera.position.y * 2 + 1.25;

  setTimeout(() => {
    if (currentVrm) {
      currentVrm.blendShapeProxy.setValue(
        THREE.VRMSchema.BlendShapePresetName.BlinkL,
        0
      );
      currentVrm.blendShapeProxy.setValue(
        THREE.VRMSchema.BlendShapePresetName.BlinkR,
        0
      );
    }
  }, blinktimeout);

  if (currentVrm) {
    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.BlinkL,
      1
    );
    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.BlinkR,
      1
    );
  }
}

(function loop() {
  const rand = Math.round(Math.random() * 10000) + 1000;
  setTimeout(function () {
    blink();
    loop();
  }, rand);
})();

// Drag and drop
window.addEventListener("dragover", function (event) {
  event.preventDefault();
});

window.addEventListener("drop", function (event) {
  event.preventDefault();

  const files = event.dataTransfer.files;
  if (!files) return;
  const file = files[0];
  if (!file) return;
  const blob = new Blob([file], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  load(url);
});

// Window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Interface handling
var talktime = true;

function hideinfo() {
  const a = document.getElementById("backplate");
  const y = document.getElementById("credits");
  a.style.display = "none";
  y.style.display = "none";
}

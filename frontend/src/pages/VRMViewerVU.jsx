import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRM, VRMSchema } from "@pixiv/three-vrm";

const VRMViewerVU = ({
  vrmModel = "https://automattic.github.io/VU-VRM/assets/VU-VRM-elf.vrm",
}) => {
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const vrmRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const lookAtTargetRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const javascriptNodeRef = useRef(null);

  const settingsRef = useRef({
    mouthThreshold: 10,
    mouthBoost: 10,
    bodyThreshold: 10,
    bodyMotion: 10,
    expression: 80,
  });

  const expressionYayRef = useRef(0);
  const expressionOofRef = useRef(0);
  const expressionLimitYayRef = useRef(0.5);
  const expressionLimitOofRef = useRef(0.5);
  const expressionEaseRef = useRef(100);

  const talkTimeRef = useRef(true);

  const startBlinkLoop = useCallback(() => {
    const blink = () => {
      const blinkTimeout = Math.floor(Math.random() * 250) + 50;
      lookAtTargetRef.current.position.y =
        cameraRef.current.position.y - cameraRef.current.position.y * 2 + 1.25;

      setTimeout(() => {
        if (vrmRef.current) {
          vrmRef.current.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.BlinkL,
            0
          );
          vrmRef.current.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.BlinkR,
            0
          );
        }
      }, blinkTimeout);

      if (vrmRef.current) {
        vrmRef.current.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.BlinkL,
          1
        );
        vrmRef.current.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.BlinkR,
          1
        );
      }
    };

    const loop = () => {
      const rand = Math.round(Math.random() * 10000) + 1000;
      setTimeout(() => {
        blink();
        loop();
      }, rand);
    };

    loop();
  }, []);

  const loadVRM = useCallback(
    (url) => {
      const loader = new GLTFLoader();
      loader.crossOrigin = "anonymous";

      loader.load(
        url,
        (gltf) => {
          VRM.from(gltf).then((vrm) => {
            if (vrmRef.current) {
              sceneRef.current.remove(vrmRef.current.scene);
              vrmRef.current.dispose();
            }

            vrmRef.current = vrm;
            sceneRef.current.add(vrm.scene);

            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Hips
            ).rotation.y = Math.PI;
            vrm.springBoneManager.reset();

            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightUpperArm
            ).rotation.z = 250;
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightLowerArm
            ).rotation.z = -0.2;
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftUpperArm
            ).rotation.z = -250;
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftLowerArm
            ).rotation.z = 0.2;

            const randomSomeSuch = () => (Math.random() - 0.5) / 10;

            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.x = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.y = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.z = randomSomeSuch();

            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.x = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.y = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.z = randomSomeSuch();

            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Spine
            ).rotation.x = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Spine
            ).rotation.y = randomSomeSuch();
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Spine
            ).rotation.z = randomSomeSuch();

            vrm.lookAt.target = lookAtTargetRef.current;
            vrm.springBoneManager.reset();

            startBlinkLoop();
          });
        },
        (progress) =>
          console.log(
            "Loading VRM...",
            100.0 * (progress.loaded / progress.total),
            "%"
          ),
        (error) => console.error("VRM Load Error:", error)
      );
    },
    [startBlinkLoop]
  );

  const processAudioInput = useCallback((inputVolume) => {
    if (!vrmRef.current) return;

    const vrm = vrmRef.current;
    const settings = settingsRef.current;

    if (talkTimeRef.current) {
      const vowelDamp = 53;
      const vowelMin = 12;

      if (inputVolume > settings.mouthThreshold * 2) {
        const mouthValue =
          ((inputVolume - vowelMin) / vowelDamp) * (settings.mouthBoost / 10);
        vrm.blendShapeProxy.setValue(
          VRMSchema.BlendShapePresetName.A,
          mouthValue
        );
      } else {
        vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.A, 0);
      }
    }

    const damping = 750 / (settings.bodyMotion / 10);
    const springback = 1.001;

    if (inputVolume > 1 * settings.bodyThreshold) {

      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.x +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.x /=
        springback;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.y +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.y /=
        springback;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.z +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.z /=
        springback;

      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.x +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.x /=
        springback;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.y +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.y /=
        springback;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.z +=
        (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.z /=
        springback;

      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.x += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.x /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.y += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.y /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.z += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.UpperChest
      ).rotation.z /= springback;

      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.x += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.x /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.y += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.y /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.z += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.RightShoulder
      ).rotation.z /= springback;

      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.x += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.x /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.y += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.y /= springback;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.z += (Math.random() - 0.5) / damping;
      vrm.humanoid.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftShoulder
      ).rotation.z /= springback;
    }

    expressionYayRef.current +=
      (Math.random() - 0.5) / expressionEaseRef.current;
    if (expressionYayRef.current > expressionLimitYayRef.current)
      expressionYayRef.current = expressionLimitYayRef.current;
    if (expressionYayRef.current < 0) expressionYayRef.current = 0;
    vrm.blendShapeProxy.setValue(
      VRMSchema.BlendShapePresetName.Fun,
      expressionYayRef.current
    );

    expressionOofRef.current +=
      (Math.random() - 0.5) / expressionEaseRef.current;
    if (expressionOofRef.current > expressionLimitOofRef.current)
      expressionOofRef.current = expressionLimitOofRef.current;
    if (expressionOofRef.current < 0) expressionOofRef.current = 0;
    vrm.blendShapeProxy.setValue(
      VRMSchema.BlendShapePresetName.Angry,
      expressionOofRef.current
    );

    lookAtTargetRef.current.position.x = cameraRef.current.position.x;
    lookAtTargetRef.current.position.y =
      (cameraRef.current.position.y -
        cameraRef.current.position.y -
        cameraRef.current.position.y) /
        2 +
      0.5;
  }, []);

  const setupMicrophone = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        microphoneRef.current = microphone;
        javascriptNodeRef.current = javascriptNode;

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);

          let values = 0;
          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }

          const average = values / length;
          const inputVolume = average;

          processAudioInput(inputVolume);
        };
      })
      .catch((err) => {
        console.log("Microphone error:", err.name);
      });
  }, [processAudioInput]);

  const animate = useCallback(() => {
    requestAnimationFrame(animate);

    const deltaTime = clockRef.current.getDelta();

    if (vrmRef.current) {
      vrmRef.current.update(deltaTime);
    }

    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  const onWindowResize = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current) return;

    cameraRef.current.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  }, []);

  const initializeVRM = useCallback(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(
      30.0,
      window.innerWidth / window.innerHeight,
      0.1,
      20.0
    );
    camera.position.set(0.0, 1.45, 0.75);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0.0, 1.45, 0.0);
    controls.update();
    controlsRef.current = controls;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(light);

    const lookAtTarget = new THREE.Object3D();
    camera.add(lookAtTarget);
    lookAtTargetRef.current = lookAtTarget;

    loadVRM(vrmModel);

    setupMicrophone();

    animate();

    window.addEventListener("resize", onWindowResize);

    setIsInitialized(true);
  }, [
    isInitialized,
    vrmModel,
    loadVRM,
    setupMicrophone,
    animate,
    onWindowResize,
  ]);

  const cleanup = useCallback(() => {
    if (javascriptNodeRef.current) {
      javascriptNodeRef.current.disconnect();
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    if (vrmRef.current) {
      vrmRef.current.dispose();
    }
    window.removeEventListener("resize", onWindowResize);
  }, [onWindowResize]);

  useEffect(() => {
    initializeVRM();

    return () => {
      cleanup();
    };
  }, [initializeVRM, cleanup]);

  return (
    <div className="vrm-viewer">
      <canvas ref={canvasRef} className="vrm-canvas" />
    </div>
  );
};

export default VRMViewerVU;

import React from "react";

const VRMViewer = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/vrm-viewer/index.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="VRM Viewer"
        allow="microphone"
      />
    </div>
  );
};

export default VRMViewer;

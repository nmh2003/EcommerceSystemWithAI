import "./ProgressSteps.css";

function ProgressSteps({ step1, step2, step3 }) {

  return (
    <div className="progress-steps-container">

      <div className={`progress-step ${step1 ? "completed" : ""}`}>

        <span className="step-label">Đăng nhập</span>

        <div className="step-checkmark">✅</div>
      </div>

      {step2 && (
        <>

          {step1 && <div className="progress-line completed"></div>}

          <div className={`progress-step ${step1 ? "completed" : ""}`}>

            <span className="step-label">Giao hàng</span>

            <div className="step-checkmark">✅</div>
          </div>
        </>
      )}

      <>

        {step1 && step2 && step3 ? (
          <div className="progress-line completed"></div>
        ) : (
          ""
        )}

        <div className={`progress-step ${step3 ? "completed" : ""}`}>

          <span className={`step-label ${!step3 ? "step3-offset" : ""}`}>
            Tóm tắt
          </span>

          {step1 && step2 && step3 ? (
            <div className="step-checkmark">✅</div>
          ) : (
            ""
          )}
        </div>
      </>
    </div>
  );
}

export default ProgressSteps;

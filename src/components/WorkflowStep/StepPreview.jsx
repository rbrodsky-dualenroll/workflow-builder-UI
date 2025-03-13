import React from 'react';
import ApprovalStepPreview from './previews/ApprovalStepPreview';
import UploadStepPreview from './previews/UploadStepPreview';
import InformationStepPreview from './previews/InformationStepPreview';
import ProvideConsentStepPreview from './previews/ProvideConsentStepPreview';
import CheckHoldsStepPreview from './previews/CheckHoldsStepPreview';
import RegisterViaApiStepPreview from './previews/RegisterViaApiStepPreview';
import ResolveIssueStepPreview from './previews/ResolveIssueStepPreview';
import PendingCompletionOfOneTimeStepsPreview from './previews/PendingCompletionOfOneTimeStepsPreview';
import PendingCompletionOfPerTermStepsPreview from './previews/PendingCompletionOfPerTermStepsPreview';
import PendingCompletionOfPerYearStepsPreview from './previews/PendingCompletionOfPerYearStepsPreview';

/**
 * Container component for step previews
 */
const StepPreview = ({ step }) => {
  const renderStepPreview = () => {
    switch (step.stepType) {
      case 'Approval':
        return <ApprovalStepPreview step={step} />;
      case 'Upload':
        return <UploadStepPreview step={step} />;
      case 'Information':
        return <InformationStepPreview step={step} />;
      case 'ProvideConsent':
        return <ProvideConsentStepPreview step={step} />;
      case 'CheckHolds':
        return <CheckHoldsStepPreview step={step} />;
      case 'RegisterViaApi':
        return <RegisterViaApiStepPreview step={step} />;
      case 'ResolveIssue':
        return <ResolveIssueStepPreview step={step} />;
      case 'PendingCompletionOfOneTimeSteps':
        return <PendingCompletionOfOneTimeStepsPreview step={step} />;
      case 'PendingCompletionOfPerTermSteps':
        return <PendingCompletionOfPerTermStepsPreview step={step} />;
      case 'PendingCompletionOfPerYearSteps':
        return <PendingCompletionOfPerYearStepsPreview step={step} />;
      default:
        return <p>Unknown step type</p>;
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      {renderStepPreview()}
    </div>
  );
};

export default StepPreview;

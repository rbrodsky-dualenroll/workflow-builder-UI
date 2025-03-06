import React from 'react';
import Card from '../../common/Card';

/**
 * Provides a preview of how a step will look to users
 */
const StepPreview = ({ step }) => {
  if (!step) return null;

  // Determine step icon and color based on role
  const getRoleStyles = (role) => {
    switch (role) {
      case 'College':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '🏛️' };
      case 'High School':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: '🏫' };
      case 'Student':
        return { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '👨‍🎓' };
      case 'Parent':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '👪' };
      case 'Approver':
        return { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '✓' };
      case 'System':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '⚙️' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📝' };
    }
  };

  const roleStyles = getRoleStyles(step.role);

  return (
    <Card title="Step Preview" className="bg-white mb-6">
      <div className="border border-gray-200 rounded-md p-4">
        {/* Step header */}
        <div className="flex items-center mb-3">
          <div className={`w-8 h-8 rounded-full ${roleStyles.bgColor} flex items-center justify-center mr-2`}>
            <span>{roleStyles.icon}</span>
          </div>
          <div>
            <h3 className={`text-lg font-medium ${roleStyles.color}`}>
              {step.role}: {step.title}
            </h3>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>

        {/* Step content based on type */}
        <div className="mb-4">
          {step.stepType === 'Upload' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Required Documents:</h4>
              {step.fileUploads && step.fileUploads.map((upload, index) => (
                <div key={index} className="flex items-center ml-2">
                  <div className="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center text-xs mr-2">📎</div>
                  <span className="text-sm">{upload.label}{upload.required && ' *'}</span>
                </div>
              ))}
            </div>
          )}

          {step.stepType === 'Information' && (
            <div className="space-y-2">
              {step.informationDisplays && step.informationDisplays.map((info, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm">{info.content}</p>
                </div>
              ))}
            </div>
          )}

          {step.stepType === 'Approval' && (
            <div className="space-y-2">
              {step.actionOptions && step.actionOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {step.actionOptions.map((action, index) => {
                    // Determine button style based on action type
                    let buttonClass = '';
                    if (action.value.includes('approve') || action.value.includes('yes')) {
                      buttonClass = 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
                    } else if (action.value.includes('decline') || action.value.includes('no')) {
                      buttonClass = 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
                    } else if (action.value.includes('return')) {
                      buttonClass = 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
                    } else {
                      buttonClass = 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
                    }
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`px-3 py-1 rounded border text-sm ${buttonClass}`}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments section */}
        {step.comments && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Comments {step.comments.required && '*'}
              </label>
              <div className="mt-1">
                <div className="w-full h-20 bg-gray-50 border border-gray-300 rounded-md"></div>
              </div>
            </div>
          </div>
        )}

        {/* Complete step button */}
        <div className="mt-4 border-t border-gray-200 pt-4 flex justify-end">
          <button
            type="button"
            className="bg-primary hover:bg-primary-600 text-white rounded px-4 py-2 text-sm"
          >
            COMPLETE STEP
          </button>
        </div>
      </div>
    </Card>
  );
};

export default StepPreview;

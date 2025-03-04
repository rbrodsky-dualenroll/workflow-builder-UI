import { useState, useEffect } from 'react';

const StepForm = ({ initialData = {}, onSubmit, onCancel, scenarioId, scenarioCondition }) => {
  // Display scenario info if in a scenario other than main
  const isConditionalScenario = scenarioId && scenarioId !== 'main';
  
  useEffect(() => {
    // If we're in a conditional scenario, set the conditional flag by default
    if (isConditionalScenario && !initialData.id) {
      setFormData(prev => ({
        ...prev,
        conditional: true,
        triggeringCondition: scenarioCondition || ''
      }));
    }
  }, [isConditionalScenario, scenarioId, scenarioCondition, initialData]);

  const [formData, setFormData] = useState({
    stepType: 'Approval',
    title: '',
    role: 'College',
    subworkflow: 'Per Course',
    description: '',
    conditional: false,
    triggeringCondition: '',
    actionOptions: [],
    fileUploads: [],
    informationDisplays: [],
    tableColumns: ['Student Name', 'Course Number', 'CRN', 'Instructor'],
    feedbackLoops: {
      recipient: '',
      nextStep: ''
    },
    comments: {
      required: false,
      public: true
    },
    // Fields for CheckHolds step
    holdCodes: '',
    // Fields for RegisterViaApi step
    apiEndpoint: '',
    // Fields for ProvideConsent step
    consentType: 'all',
    // Fields for ResolveIssue step
    issueType: '',
    ...initialData
  });

  // Template data for action options
  const commonActionOptionTemplates = [
    { label: 'Approve', value: 'approve-yes' },
    { label: 'Decline', value: 'decline-no' },
    { label: 'Defer', value: 'defer' },
    { label: 'Send to High School for additional info', value: 'hs-info' },
    { label: 'Send to Student for additional info', value: 'student-info' }
  ];

  // Template data for common table columns
  const commonTableColumns = [
    'Student Name', 
    'Course Number', 
    'Course Title',
    'CRN', 
    'Section',
    'Instructor',
    'Term',
    'Credits',
    'Status',
    'High School',
    'Hold Names',
    'Messages',
    'Fee Amount',
    'Payment Status',
    'Grade'
  ];

  const [tempActionOption, setTempActionOption] = useState({ label: '', value: '' });
  const [tempFileUpload, setTempFileUpload] = useState({ fileType: '', label: '' });
  const [tempInfoDisplay, setTempInfoDisplay] = useState('');
  const [tempTableColumn, setTempTableColumn] = useState('');
  
  // Variable to track whether to show predefined actions
  const [showActionTemplates, setShowActionTemplates] = useState(false);
  // Variable to track whether to show common table columns
  const [showTableColumnTemplates, setShowTableColumnTemplates] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        stepType: 'Approval',
        title: '',
        role: 'College',
        subworkflow: 'Per Course',
        description: '',
        conditional: false,
        triggeringCondition: '',
        actionOptions: [],
        fileUploads: [],
        informationDisplays: [],
        tableColumns: ['Student Name', 'Course Number', 'CRN', 'Instructor'],
        feedbackLoops: {
          recipient: '',
          nextStep: ''
        },
        comments: {
          required: false,
          public: true
        },
        // Fields for CheckHolds step
        holdCodes: '',
        // Fields for RegisterViaApi step
        apiEndpoint: '',
        // Fields for ProvideConsent step
        consentType: 'all',
        // Fields for ResolveIssue step
        issueType: '',
        ...initialData
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      feedbackLoops: {
        ...formData.feedbackLoops,
        [name]: value
      }
    });
  };

  const handleCommentsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      comments: {
        ...formData.comments,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const addActionOption = () => {
    if (tempActionOption.label.trim() === '') return;
    
    setFormData({
      ...formData,
      actionOptions: [...formData.actionOptions, { ...tempActionOption }]
    });
    setTempActionOption({ label: '', value: '' });
  };

  const addActionTemplate = (template) => {
    if (!formData.actionOptions.some(opt => opt.value === template.value)) {
      setFormData({
        ...formData,
        actionOptions: [...formData.actionOptions, { ...template }]
      });
    }
  };

  const addCommonTableColumn = (column) => {
    if (!formData.tableColumns.includes(column)) {
      setFormData({
        ...formData,
        tableColumns: [...formData.tableColumns, column]
      });
    }
  };

  const removeActionOption = (index) => {
    const updatedOptions = [...formData.actionOptions];
    updatedOptions.splice(index, 1);
    setFormData({
      ...formData,
      actionOptions: updatedOptions
    });
  };

  const addFileUpload = () => {
    if (tempFileUpload.label.trim() === '' || tempFileUpload.fileType.trim() === '') return;
    
    setFormData({
      ...formData,
      fileUploads: [...formData.fileUploads, { ...tempFileUpload }]
    });
    setTempFileUpload({ fileType: '', label: '' });
  };

  const removeFileUpload = (index) => {
    const updatedUploads = [...formData.fileUploads];
    updatedUploads.splice(index, 1);
    setFormData({
      ...formData,
      fileUploads: updatedUploads
    });
  };

  const addInfoDisplay = () => {
    if (tempInfoDisplay.trim() === '') return;
    
    setFormData({
      ...formData,
      informationDisplays: [...formData.informationDisplays, tempInfoDisplay]
    });
    setTempInfoDisplay('');
  };

  const removeInfoDisplay = (index) => {
    const updatedDisplays = [...formData.informationDisplays];
    updatedDisplays.splice(index, 1);
    setFormData({
      ...formData,
      informationDisplays: updatedDisplays
    });
  };

  const addTableColumn = () => {
    if (tempTableColumn.trim() === '') return;
    
    setFormData({
      ...formData,
      tableColumns: [...formData.tableColumns, tempTableColumn]
    });
    setTempTableColumn('');
  };

  const removeTableColumn = (index) => {
    const updatedColumns = [...formData.tableColumns];
    updatedColumns.splice(index, 1);
    setFormData({
      ...formData,
      tableColumns: updatedColumns
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="stepType" className="block text-sm font-medium text-gray-700 mb-1">Step Type</label>
          <select
            id="stepType"
            name="stepType"
            value={formData.stepType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Approval">Approval</option>
            <option value="Upload">Document Upload</option>
            <option value="Information">Information</option>
            <option value="ProvideConsent">Provide Consent</option>
            <option value="CheckHolds">Check Holds</option>
            <option value="RegisterViaApi">Register Via API</option>
            <option value="ResolveIssue">Resolve Issue</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subworkflow" className="block text-sm font-medium text-gray-700 mb-1">Sub-workflow</label>
          <select
            id="subworkflow"
            name="subworkflow"
            value={formData.subworkflow}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Once Ever">Once Ever</option>
            <option value="Per Year">Per Year</option>
            <option value="Per Term">Per Term</option>
            <option value="Per Course">Per Course</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder={`${formData.stepType} Step`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="College">College</option>
            <option value="High School">High School</option>
            <option value="Student">Student</option>
            <option value="Parent">Parent</option>
            <option value="System">System</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter step description"
          rows="3"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        ></textarea>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        {isConditionalScenario && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Conditional Scenario: {scenarioId}</h3>
            <p className="text-xs text-blue-700">This step is part of the "{scenarioId}" scenario.</p>
            {scenarioCondition && (
              <p className="text-xs text-blue-700 mt-1">
                <span className="font-medium">Scenario condition:</span> {scenarioCondition}
              </p>
            )}
          </div>
        )}
        
        <div className="flex items-center mb-4">
          <input
            id="conditional"
            name="conditional"
            type="checkbox"
            checked={formData.conditional}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="conditional" className="ml-2 text-sm font-medium text-gray-700">Is this step conditional?</label>
        </div>

        {formData.conditional && (
          <div className="ml-6">
            <label htmlFor="triggeringCondition" className="block text-sm font-medium text-gray-700 mb-1">Triggering Condition</label>
            <input
              id="triggeringCondition"
              name="triggeringCondition"
              type="text"
              value={formData.triggeringCondition}
              onChange={handleChange}
              placeholder="e.g., student.gpa > 3.0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>

      {formData.stepType !== 'Information' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Table Columns</h3>
          <p className="text-sm text-gray-600 mb-3">Define what information columns will appear in the step table:</p>
          
          <div className="space-y-2 mb-4">
            {formData.tableColumns.map((column, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                <span className="text-sm">{column}</span>
                <button 
                  type="button" 
                  onClick={() => removeTableColumn(index)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowTableColumnTemplates(!showTableColumnTemplates)}
              className="text-primary bg-white text-sm flex items-center border border-gray-200 px-3 py-1 rounded"
            >
              {showTableColumnTemplates ? 'Hide' : 'Show'} common table columns
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showTableColumnTemplates ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showTableColumnTemplates && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {commonTableColumns.map((column, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addCommonTableColumn(column)}
                      className="text-left text-sm px-2 py-1 rounded flex items-center text-primary bg-white"
                      disabled={formData.tableColumns.includes(column)}
                    >
                      <span className="w-4 h-4 mr-2 flex-shrink-0">+</span>
                      {column}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              value={tempTableColumn}
              onChange={(e) => setTempTableColumn(e.target.value)}
              placeholder="New Column Name"
              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button 
              type="button" 
              onClick={addTableColumn}
              className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
            >
              Add Column
            </button>
          </div>
        </div>
      )}

      {formData.stepType === 'Approval' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Action Options</h3>
          <p className="text-sm text-gray-600 mb-3">These will appear as radio button choices in the step:</p>
          
          <div className="space-y-2 mb-4">
            {formData.actionOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 border border-gray-400 rounded-full mr-2"></span>
                  <span className="text-sm">{option.label} <span className="text-gray-500 text-xs">({option.value})</span></span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeActionOption(index)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowActionTemplates(!showActionTemplates)}
              className="text-primary bg-white text-sm flex items-center border border-gray-200 px-3 py-1 rounded"
            >
              {showActionTemplates ? 'Hide' : 'Show'} common action options
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showActionTemplates ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showActionTemplates && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonActionOptionTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addActionTemplate(template)}
                      className="text-left text-sm px-2 py-1 rounded flex items-center text-primary bg-white"
                    >
                      <span className="w-4 h-4 mr-2 flex-shrink-0">+</span>
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={tempActionOption.label}
              onChange={(e) => setTempActionOption({ ...tempActionOption, label: e.target.value })}
              placeholder="Button Label (e.g., Approve)"
              className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={tempActionOption.value}
              onChange={(e) => setTempActionOption({ ...tempActionOption, value: e.target.value })}
              placeholder="Value (e.g., approve-yes)"
              className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button 
              type="button" 
              onClick={addActionOption}
              className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
            >
              Add Option
            </button>
          </div>

          <h3 className="text-md font-medium text-gray-800 mb-3 mt-6">Feedback Loops</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="feedbackRecipient" className="block text-sm font-medium text-gray-700 mb-1">Send feedback to</label>
              <select
                id="feedbackRecipient"
                name="recipient"
                value={formData.feedbackLoops.recipient}
                onChange={handleFeedbackChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700"
              >
                <option value="">None</option>
                <option value="Student">Student</option>
                <option value="High School">High School</option>
                <option value="College">College</option>
              </select>
            </div>

            {formData.feedbackLoops.recipient && (
              <div>
                <label htmlFor="feedbackNextStep" className="block text-sm font-medium text-gray-700 mb-1">Feedback Next Step</label>
                <input
                  id="feedbackNextStep"
                  name="nextStep"
                  type="text"
                  value={formData.feedbackLoops.nextStep}
                  onChange={handleFeedbackChange}
                  placeholder="Enter the next step name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {formData.stepType === 'Upload' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">File Uploads</h3>
          <div className="space-y-2 mb-4">
            {formData.fileUploads.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                <span className="text-sm">{file.label} <span className="text-gray-500 text-xs">({file.fileType})</span></span>
                <button 
                  type="button" 
                  onClick={() => removeFileUpload(index)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              value={tempFileUpload.label}
              onChange={(e) => setTempFileUpload({ ...tempFileUpload, label: e.target.value })}
              placeholder="File Label (e.g., Transcript)"
              className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={tempFileUpload.fileType}
              onChange={(e) => setTempFileUpload({ ...tempFileUpload, fileType: e.target.value })}
              placeholder="File Type (e.g., pdf)"
              className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button 
              type="button" 
              onClick={addFileUpload}
              className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
            >
              Add File
            </button>
          </div>
        </div>
      )}

      {formData.stepType === 'Information' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Information Displays</h3>
          <div className="space-y-2 mb-4">
            {formData.informationDisplays.map((display, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
                <span className="text-sm">{display}</span>
                <button 
                  type="button" 
                  onClick={() => removeInfoDisplay(index)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              value={tempInfoDisplay}
              onChange={(e) => setTempInfoDisplay(e.target.value)}
              placeholder="Information to display"
              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button 
              type="button" 
              onClick={addInfoDisplay}
              className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
            >
              Add Display
            </button>
          </div>
        </div>
      )}
      
      {formData.stepType === 'ProvideConsent' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Consent Step</h3>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
            <p className="text-sm text-gray-700">This step will require the parent or guardian to provide consent for the student's enrollment.</p>
          </div>
        </div>
      )}
      
      {formData.stepType === 'CheckHolds' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Hold Check Configuration</h3>
          <div className="form-group mb-4">
            <label htmlFor="holdCodes" className="block text-sm font-medium text-gray-700 mb-1">Hold Codes (comma separated or *any*)</label>
            <input
              id="holdCodes"
              name="holdCodes"
              type="text"
              value={formData.holdCodes}
              onChange={handleChange}
              placeholder="e.g., ORIEN, FINAID, ADVISING or *any*"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
            <p className="text-sm text-gray-700">This step will check for holds on the student's account. You can specify which hold codes to check for, or use *any* to check for any holds.</p>
          </div>
        </div>
      )}
      
      {formData.stepType === 'RegisterViaApi' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">API Registration Configuration</h3>
          <div className="form-group mb-4">
            <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
            <select
              id="apiEndpoint"
              name="apiEndpoint"
              value={formData.apiEndpoint}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select an API endpoint</option>
              <option value="EthosApi">Ethos API</option>
              <option value="BannerApi">Banner API</option>
              <option value="ColleagueApi">Colleague API</option>
              <option value="Custom">Custom API</option>
            </select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
            <p className="text-sm text-gray-700">This step will register the student via the selected API integration. The system will automatically handle the API communication.</p>
          </div>
        </div>
      )}
      
      {formData.stepType === 'ResolveIssue' && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h3 className="text-md font-medium text-gray-800 mb-3">Issue Resolution Configuration</h3>
          <div className="form-group mb-4">
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select an issue type</option>
              <option value="RegistrationIssue">Registration Issue</option>
              <option value="PaymentIssue">Payment Issue</option>
              <option value="PrerequisiteIssue">Prerequisite Issue</option>
              <option value="HoldIssue">Hold Issue</option>
              <option value="Other">Other Issue</option>
            </select>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-300 mb-4">
            <p className="text-sm text-gray-700">This step allows the specified role to resolve issues that have occurred during the workflow process.</p>
          </div>
          
          <div className="space-y-2 mb-4">
            {formData.fileUploads.length === 0 && (
              <p className="text-xs text-gray-500 italic">Consider adding file uploads if supporting documents are needed to resolve the issue.</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Comments</h3>
        <div className="flex items-center mb-4">
          <input
            id="commentsRequired"
            name="required"
            type="checkbox"
            checked={formData.comments.required}
            onChange={handleCommentsChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="commentsRequired" className="ml-2 text-sm font-medium text-gray-700">Require Comments</label>
        </div>

        {formData.comments.required && (
          <div className="flex items-center mb-4 ml-6">
            <input
              id="commentsPublic"
              name="public"
              type="checkbox"
              checked={formData.comments.public}
              onChange={handleCommentsChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="commentsPublic" className="ml-2 text-sm font-medium text-gray-700">Make Comments Public</label>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md"
        >
          Save Step
        </button>
      </div>
    </form>
  );
};

export default StepForm;

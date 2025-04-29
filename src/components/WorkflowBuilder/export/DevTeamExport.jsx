import React, { useState } from 'react';
import { generateRubyFixture } from './rubyFixtureExporter';
import { exportZipArchive } from './multiFileExporter';

/**
 * DevTeamExport - A component that allows exporting the current workflow 
 * in a format compatible with DualEnroll Ruby fixtures
 * Updated to work with the flat workflow structure
 */
const DevTeamExport = ({ workflow, workflowName, collegeInfo, setCollegeInfo, onClose, workflowConditions }) => {
  const [localCollegeName, setLocalCollegeName] = useState(collegeInfo.name || '');
  const [localCollegeId, setLocalCollegeId] = useState(collegeInfo.id || '');
  const [localCollegeCity, setLocalCollegeCity] = useState(collegeInfo.city || '');
  const [localCollegeState, setLocalCollegeState] = useState(collegeInfo.state || '');
  const [localCollegeZip, setLocalCollegeZip] = useState(collegeInfo.zip || '');
  const [localCollegePhone, setLocalCollegePhone] = useState(collegeInfo.phone || '');
  const [localCollegeUrl, setLocalCollegeUrl] = useState(collegeInfo.url || '');
  const [localCollegeType, setLocalCollegeType] = useState(collegeInfo.type || 'Public: 2-year');
  const [includeApplicationFields, setIncludeApplicationFields] = useState(true);
  const [includeInitializers, setIncludeInitializers] = useState(true);
  const [includeViewTemplates, setIncludeViewTemplates] = useState(true);
  const [exportType, setExportType] = useState('zip'); // 'zip' or 'single'
  const [exportedCode, setExportedCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Generate the workflow files
   */
  const generateFixture = async () => {
    if (!localCollegeName || !localCollegeId) {
      alert('College Name and ID are required');
      return;
    }
    
    // Save the college info to the parent state
    setCollegeInfo({
      name: localCollegeName,
      id: localCollegeId,
      city: localCollegeCity,
      state: localCollegeState,
      zip: localCollegeZip,
      phone: localCollegePhone.replace(/[^0-9]/g, ''),
      url: localCollegeUrl,
      type: localCollegeType
    });

    try {
      setIsExporting(true);
      
      // Prepare additional college data
      const collegeData = {
        name: localCollegeName,
        id: localCollegeId,
        city: localCollegeCity,
        state: localCollegeState,
        zip: localCollegeZip,
        phone: localCollegePhone.replace(/[^0-9]/g, ''), // Remove non-numeric characters
        url: localCollegeUrl,
        type: localCollegeType
      };
      
      // Create data for the exporters with the single workflow approach
      const compatibleData = {
        workflow,
        workflowName,
        conditions: workflowConditions || {}
      };
      
      if (exportType === 'zip') {
        // Generate and download multiple files as a ZIP archive
        await exportZipArchive(
          compatibleData, 
          collegeData,
          { 
            includeApplicationFields,
            includeInitializers,
            includeViewTemplates
          }
        );
        setIsExporting(false);
      } else {
        // Generate the Ruby fixture code with options for preview
        const rubyCode = generateRubyFixture(
          compatibleData, 
          collegeData,
          { includeApplicationFields }
        );
        
        setExportedCode(rubyCode);
        setShowPreview(true);
        setIsExporting(false);
      }
    } catch (error) {
      console.error('Error generating fixture:', error);
      alert('Error generating fixture: ' + error.message);
      setIsExporting(false);
    }
  };

  /**
   * Download the generated Ruby fixture file
   */
  const downloadFixture = () => {
    if (!exportedCode) return;
    
    const filename = `${localCollegeName.toLowerCase().replace(/[^a-z0-9]/g, '')}_fixture.rb`;
    const blob = new Blob([exportedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-5 bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto rounded-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Export for Dev Team</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showPreview ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              This will generate Ruby files that can be used by the development team to implement your workflow.
              You can choose to export a single fixture file or a ZIP archive containing multiple files.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="collegeName"
                  value={localCollegeName}
                  onChange={(e) => setLocalCollegeName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Example University"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="collegeId" className="block text-sm font-medium text-gray-700">
                  College ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="collegeId"
                  value={localCollegeId}
                  onChange={(e) => setLocalCollegeId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="12345"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This is the college's ID in the database
                </p>
              </div>
              
              <div>
                <label htmlFor="collegeCity" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="collegeCity"
                  value={localCollegeCity}
                  onChange={(e) => setLocalCollegeCity(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Anytown"
                />
              </div>
              
              <div>
                <label htmlFor="collegeState" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="collegeState"
                  value={localCollegeState}
                  onChange={(e) => setLocalCollegeState(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              
              <div>
                <label htmlFor="collegeZip" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="collegeZip"
                  value={localCollegeZip}
                  onChange={(e) => setLocalCollegeZip(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="12345"
                  maxLength={10}
                />
              </div>
              
              <div>
                <label htmlFor="collegePhone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="collegePhone"
                  value={localCollegePhone}
                  onChange={(e) => setLocalCollegePhone(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="555-123-4567"
                />
              </div>
              
              <div>
                <label htmlFor="collegeUrl" className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="text"
                  id="collegeUrl"
                  value={localCollegeUrl}
                  onChange={(e) => setLocalCollegeUrl(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="www.example.edu"
                />
              </div>
              
              <div>
                <label htmlFor="collegeType" className="block text-sm font-medium text-gray-700">
                  Institution Type
                </label>
                <select
                  id="collegeType"
                  value={localCollegeType}
                  onChange={(e) => setLocalCollegeType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Public: 2-year">Public: 2-year</option>
                  <option value="Public: 4-year or above">Public: 4-year or above</option>
                  <option value="Private: 2-year">Private: 2-year</option>
                  <option value="Private: 4-year or above">Private: 4-year or above</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="exportTypeZip"
                      name="exportType"
                      type="radio"
                      value="zip"
                      checked={exportType === 'zip'}
                      onChange={() => setExportType('zip')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="exportTypeZip" className="ml-2 block text-sm text-gray-700">
                      ZIP Archive (Multiple Files)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="exportTypeSingle"
                      name="exportType"
                      type="radio"
                      value="single"
                      checked={exportType === 'single'}
                      onChange={() => setExportType('single')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="exportTypeSingle" className="ml-2 block text-sm text-gray-700">
                      Single Fixture File
                    </label>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  The ZIP archive includes initializer classes that handle workflow conditions
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="includeApplicationFields"
                  name="includeApplicationFields"
                  type="checkbox"
                  checked={includeApplicationFields}
                  onChange={(e) => setIncludeApplicationFields(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="includeApplicationFields" className="ml-2 block text-sm text-gray-700">
                  Include standard application fields and pages
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Adds common student application fields, pages and a basic enrollment form to the fixture
              </p>
              
              {exportType === 'zip' && (
                <>
                  <div className="flex items-center">
                    <input
                      id="includeInitializers"
                      name="includeInitializers"
                      type="checkbox"
                      checked={includeInitializers}
                      onChange={(e) => setIncludeInitializers(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeInitializers" className="ml-2 block text-sm text-gray-700">
                      Include initializer classes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="includeViewTemplates"
                      name="includeViewTemplates"
                      type="checkbox"
                      checked={includeViewTemplates}
                      onChange={(e) => setIncludeViewTemplates(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      data-testid="include-view-templates-checkbox"
                    />
                    <label htmlFor="includeViewTemplates" className="ml-2 block text-sm text-gray-700">
                      Include view templates
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Generates view template files for each step in the workflow
                  </p>
                </>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={generateFixture}
                disabled={isExporting || !localCollegeName || !localCollegeId}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isExporting || !localCollegeName || !localCollegeId
                    ? 'bg-indigo-300'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isExporting ? 'Generating...' : exportType === 'zip' ? 'Generate ZIP Archive' : 'Generate Fixture'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="my-4">
              <p className="text-sm text-gray-700 mb-2">
                Preview of the generated Ruby fixture file. Use the buttons below to download or go back.
              </p>
              <div className="border border-gray-300 rounded-md bg-gray-50 p-4 h-96 overflow-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">{exportedCode}</pre>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                onClick={downloadFixture}
                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTeamExport;

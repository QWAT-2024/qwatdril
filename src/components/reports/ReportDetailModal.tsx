import React from 'react';
import { X, Paperclip, Download } from 'lucide-react';

interface ReportDetailModalProps {
  report: any;
  project: any;
  author: any;
  onClose: () => void;
}

function ReportDetailModal({ report, project, author, onClose }: ReportDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-dark-50">{report.title}</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100 transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Report Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Project:</span>
                  <span className="text-black dark:text-dark-50">{project?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Author:</span>
                  <span className="text-black dark:text-dark-50">{author?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Type:</span>
                  <span className="text-black dark:text-dark-50">{report.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Status:</span>
                  <span className="text-black dark:text-dark-50">{report.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Date:</span>
                  <span className="text-black dark:text-dark-50">{report.date}</span>
                </div>
              </div>
            </div>
            
            {report.gitCommits > 0 && (
              <div>
                <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Development Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Git Commits:</span>
                    <span className="text-black dark:text-dark-50">{report.gitCommits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Lines of Code:</span>
                    <span className="text-black dark:text-dark-50">{report.linesOfCode.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Tests Added:</span>
                    <span className="text-black dark:text-dark-50">{report.testsAdded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Bugs Fixed:</span>
                    <span className="text-black dark:text-dark-50">{report.bugsFixed}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Content</h3>
            <div className="bg-gray-100 dark:bg-dark-800/30 rounded-lg p-4">
              <p className="text-gray-700 dark:text-dark-300 leading-relaxed">{report.content}</p>
            </div>
          </div>

          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Attachments</h3>
              <div className="space-y-2">
                {report.attachments.map((attachment: { name: string, url: string }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-black dark:text-dark-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {attachment.name}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                        View
                      </a>
                      <a href={attachment.url} download={attachment.name} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;

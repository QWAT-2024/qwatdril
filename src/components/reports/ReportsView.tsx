import React, { useState } from 'react';
import { db, doc, deleteDoc } from '../../firebase/firestore';
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Plus, Eye, Edit, Trash2, Share2, Paperclip } from 'lucide-react';
import ReportDetailModal from './ReportDetailModal';
import CreateReportModal from './CreateReportModal';
import EditReportModal from './EditReportModal';

// --- Define Props Interface ---
interface ReportsViewProps {
  currentUser: any;
  reports: any[];
  projects: any[];
  users: any[];
  onReportAdded: () => void;
  isSuperuser: boolean;
  superuserInfo: { organization: string } | null;
}

function ReportsView({ currentUser, reports, projects, users, onReportAdded, isSuperuser, superuserInfo }: ReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showEditReport, setShowEditReport] = useState(false);

  // --- Filter Reports Based on User Role ---
  const accessibleProjectIds = isSuperuser
    // Superuser: Get IDs of all projects in their organization
    ? projects
        .filter(p => p.organization === superuserInfo?.organization)
        .map(p => p.id)
    // Regular user: Get IDs of projects they are assigned to
    : currentUser
      ? projects
          .filter(p =>
            (p.assignedUsers && p.assignedUsers.includes(currentUser.id)) ||
            p.teamLead === currentUser.id
          )
          .map(p => p.id)
      : [];

  const reportsToDisplay = reports.filter(r => accessibleProjectIds.includes(r.projectId));

  return (
    <div className="space-y-6">
      {/* Header Actions - "Create Report" is always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateReport(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportsToDisplay.length > 0 ? (
          reportsToDisplay.map((report) => {
            const project = projects.find(p => p.id === report.projectId);
            const author = users.find(u => u.id === report.author);

            return (
              <div key={report.id} className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-800 dark:text-dark-50 font-semibold mb-2">{report.title}</h3>
                    <p className="text-gray-500 dark:text-dark-400 text-sm mb-3">{report.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'published' ? 'text-green-500 bg-green-100 dark:text-green-400 dark:bg-green-400/20' :
                    report.status === 'draft' ? 'text-yellow-500 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20' :
                    'text-gray-500 bg-gray-100 dark:text-dark-400 dark:bg-dark-400/20'
                  }`}>
                    {report.status}
                  </span>
                </div>

                {/* Report Metadata */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-dark-400 text-sm">Project:</span>
                        <span className="text-gray-800 dark:text-dark-50 text-sm font-medium">{project?.name}</span>
                    </div>
                    {/* ... other metadata */}
                </div>

                {/* Attachments */}
                {/* ... */}


                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isSuperuser && (
                      <>
                        <button onClick={() => {
                          setSelectedReport(report);
                          setShowEditReport(true);
                        }} className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this report?')) {
                            const storage = getStorage();
                            if (report.attachments && report.attachments.length > 0) {
                              for (const attachment of report.attachments) {
                                const fileRef = ref(storage, attachment.url);
                                await deleteObject(fileRef);
                              }
                            }
                            await deleteDoc(doc(db, 'reports', report.id));
                            onReportAdded();
                          }
                        }} className="p-2 text-gray-500 dark:text-dark-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                  </div>
                  <a
                    href={report.attachments[0]?.url}
                    download={report.attachments[0]?.name}
                    className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                  >
                    Download Report
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-dark-500">
            No reports found.
          </div>
        )}
      </div>


      {/* --- Modals --- */}
      {selectedReport && !showEditReport && (
        <ReportDetailModal
          report={selectedReport}
          project={projects.find(p => p.id === selectedReport.projectId)}
          author={users.find(u => u.id === selectedReport.author)}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {showCreateReport && (
        <CreateReportModal
          currentUser={currentUser}
          projects={projects}
          users={users}
          onClose={() => setShowCreateReport(false)}
          onReportAdded={onReportAdded}
        />
      )}

      {showEditReport && selectedReport && (
        <EditReportModal
          report={selectedReport}
          projects={projects}
          users={users}
          onClose={() => setShowEditReport(false)}
          onReportUpdated={onReportAdded}
        />
      )}
    </div>
  );
}

export default ReportsView;

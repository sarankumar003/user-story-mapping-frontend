import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900">
          StoryLab — turn BRDs into Jira tickets and delivery plans.
              </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          StoryLab extracts requirements from Word/PDF, summarizes the intent,
          decomposes into epics, stories, and subtasks, suggests assignees, generates a Gantt timeline,
          and syncs everything to Jira with a complete audit trail.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/app" className="btn-primary px-6 py-3">
            Request a Demo
          </Link>
          <a href="#capabilities" className="btn-secondary px-6 py-3">Explore StoryLab</a>
        </div>
      </section>

      <section id="vision" className="bg-primary-600/5 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-medium text-gray-900 text-center">Our Vision</h2>
          <p className="mt-4 text-gray-700 text-center max-w-3xl mx-auto">
            Become the product team’s trusted AI partner — transforming BRDs into clear plans,
            confident engineering decisions, and Jira-ready narratives.
          </p>
        </div>
      </section>

      <section id="pain" className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Manual, fragmented analysis</h3>
            <p className="mt-2 text-gray-600">Hours spent parsing BRDs, normalizing content, and mapping scope into Jira.</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Inconsistent breakdowns</h3>
            <p className="mt-2 text-gray-600">Different teams structure work differently, slowing planning and execution.</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Slow stakeholder updates</h3>
            <p className="mt-2 text-gray-600">No quick way to summarize, visualize timelines, and keep leadership aligned.</p>
          </div>
        </div>
      </section>

      <section id="capabilities" className="py-8">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h4 className="font-medium text-gray-900">Smart BRD Ingestion</h4>
            <p className="mt-1 text-gray-600">Upload Word/PDF and extract clean, structured context with audit logs.</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900">AI Summaries & Themes</h4>
            <p className="mt-1 text-gray-600">Concise, board-ready summaries with risks, scope and dependencies.</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900">Decomposition to Jira</h4>
            <p className="mt-1 text-gray-600">Epics, stories, subtasks with acceptance criteria and labels.</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900">Assignee Suggestions</h4>
            <p className="mt-1 text-gray-600">Map work to the right people using your Jira/teams data.</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900">Gantt Timeline</h4>
            <p className="mt-1 text-gray-600">Auto-generate milestones and delivery windows to align stakeholders.</p>
          </div>
          <div className="card">
            <h4 className="font-medium text-gray-900">One-click Jira Sync</h4>
            <p className="mt-1 text-gray-600">Create and link tickets with a complete audit trail of operations.</p>
          </div>
        </div>
      </section>

      <section id="user-journey" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">User Journey</h2>
          <div className="flowchart-container-vertical">
            {/* Step 1 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload BRD</h3>
                <p className="text-gray-600 text-sm">Upload Word/PDF documents and get instant text extraction</p>
              </div>
              <div className="flowchart-arrow-down">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Summary</h3>
                <p className="text-gray-600 text-sm">Get comprehensive summaries with key features and risk assessment</p>
              </div>
              <div className="flowchart-arrow-down">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Decomposition</h3>
                <p className="text-gray-600 text-sm">AI breaks down into epics, stories, and subtasks with estimated hours</p>
              </div>
              <div className="flowchart-arrow-down">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline Planning</h3>
                <p className="text-gray-600 text-sm">Generate Gantt charts with project, epic, and story timelines</p>
              </div>
              <div className="flowchart-arrow-down">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">5</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assignee Mapping</h3>
                <p className="text-gray-600 text-sm">AI suggests optimal team member assignments based on skills</p>
              </div>
              <div className="flowchart-arrow-down">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flowchart-step-vertical">
              <div className="flowchart-node">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">6</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Jira Integration</h3>
                <p className="text-gray-600 text-sm">One-click sync creates all tickets in Jira with proper hierarchy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="data-architecture" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Data Architecture</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-6">Processing Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Document Processing</h4>
                    <p className="text-sm text-gray-600">PyPDF2/pdfplumber for PDF, python-docx for Word documents</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">AI Analysis</h4>
                    <p className="text-sm text-gray-600">OpenAI GPT-4 for summarization, decomposition, and validation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Streaming Processing</h4>
                    <p className="text-sm text-gray-600">Chunked processing for large documents with real-time progress</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Jira REST API</h4>
                    <p className="text-sm text-gray-600">Direct integration with Jira Cloud/Server for ticket creation</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-6">Data Flow</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">BRD Upload → Text Extraction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">AI Summary → Structured JSON</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Decomposition → Epics/Stories/Subtasks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Timeline Generation → Gantt Charts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Assignee Mapping → Team Assignments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-gray-700">Jira Sync → Live Tickets</span>
                  </div>
                </div>
        </div>
            </div>
          </div>
          <div className="mt-12">
            <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">Audit Trail & Storage</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-center">
                <h4 className="font-medium text-gray-900 mb-2">Run Management</h4>
                <p className="text-sm text-gray-600">Each BRD processing session creates a unique run with complete audit trail</p>
              </div>
              <div className="card text-center">
                <h4 className="font-medium text-gray-900 mb-2">Structured Storage</h4>
                <p className="text-sm text-gray-600">JSON files for summaries, decomposition, assignments, and sync results</p>
              </div>
              <div className="card text-center">
                <h4 className="font-medium text-gray-900 mb-2">Status Tracking</h4>
                <p className="text-sm text-gray-600">Real-time status updates for each processing step with error handling</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-600/10 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-900">Ready to transform BRDs into delivery?</h3>
          <p className="mt-3 text-gray-700">See StoryLab in action.</p>
          <div className="mt-6">
            <Link href="/app" className="btn-primary px-6 py-3">Request a Demo</Link>
      </div>
    </div>
      </section>
    </main>
  )
}
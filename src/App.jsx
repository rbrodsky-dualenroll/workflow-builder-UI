import { useState } from 'react'
import './App.css'
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder'

function App() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-white p-6 shadow-md flex-shrink-0">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">DualEnroll Workflow Builder</h1>
          <p className="text-primary-50 mt-1">Create and visualize workflow processes</p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-6 overflow-auto">
        <WorkflowBuilder />
      </main>
      
      <footer className="bg-gray-800 text-white py-4 text-center flex-shrink-0">
        <p className="text-sm">© {new Date().getFullYear()} DualEnroll Workflow Builder</p>
      </footer>
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import WorkflowBuilder from './components/WorkflowBuilder'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">DualEnroll Workflow Builder</h1>
          <p className="text-primary-50 mt-1">Create and visualize workflow processes</p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6">
        <WorkflowBuilder />
      </main>
      
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} DualEnroll Workflow Builder</p>
      </footer>
    </div>
  )
}

export default App

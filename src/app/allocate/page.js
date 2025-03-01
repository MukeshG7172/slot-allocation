"use client";

import { useState } from "react";

export default function AllocationPage() {
  const [labs, setLabs] = useState([]);
  const [labInput, setLabInput] = useState({ name: "", capacity: 0 });

  const [studentGroups, setStudentGroups] = useState([]);
  const [groupInput, setGroupInput] = useState({
    year: "1",
    departments: "",
    section: "",
    count: 0,
  });

  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [departmentGroupInput, setDepartmentGroupInput] = useState({
    name: "",
    departments: "",
  });

  const [sessionAllocations, setSessionAllocations] = useState([]);
  const [unallocatedGroups, setUnallocatedGroups] = useState([]);

  const [activeTab, setActiveTab] = useState("labs");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddLab = (e) => {
    e.preventDefault();
    if (!labInput.name || labInput.capacity <= 0) {
      setError("Please provide a valid lab name and capacity");
      return;
    }

    const newLab = {
      id: Date.now().toString(),
      name: labInput.name,
      capacity: parseInt(labInput.capacity),
      available: parseInt(labInput.capacity),
      allocated: [],
    };

    setLabs([...labs, newLab]);
    setLabInput({ name: "", capacity: 0 });
    setError("");
    setSuccess("Lab added successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddGroup = (e) => {
    e.preventDefault();
    if (
      !groupInput.departments ||
      !groupInput.section ||
      groupInput.count <= 0
    ) {
      setError("Please provide valid departments, section and student count");
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      year: groupInput.year,
      departments: groupInput.departments,
      section: groupInput.section,
      count: parseInt(groupInput.count),
      allocated: false,
    };

    setStudentGroups([...studentGroups, newGroup]);
    setGroupInput({ year: "1", departments: "", section: "", count: 0 });
    setError("");
    setSuccess("Student group added successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddDepartmentGroup = (e) => {
    e.preventDefault();
    if (!departmentGroupInput.name || !departmentGroupInput.departments) {
      setError("Please provide a valid group name and departments");
      return;
    }

    const newDeptGroup = {
      id: Date.now().toString(),
      name: departmentGroupInput.name,
      departments: departmentGroupInput.departments
        .split(",")
        .map((d) => d.trim()),
    };

    setDepartmentGroups([...departmentGroups, newDeptGroup]);
    setDepartmentGroupInput({ name: "", departments: "" });
    setError("");
    setSuccess("Department group added successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveLab = (id) => {
    setLabs(labs.filter((lab) => lab.id !== id));
  };

  const handleRemoveGroup = (id) => {
    setStudentGroups(studentGroups.filter((group) => group.id !== id));
  };

  const handleRemoveDepartmentGroup = (id) => {
    setDepartmentGroups(departmentGroups.filter((group) => group.id !== id));
  };

  const allocateStudents = () => {
    if (labs.length === 0 || studentGroups.length === 0) {
      setError("Please add at least one lab and one student group");
      return;
    }
  
    const resetLabs = labs.map((lab) => ({
      ...lab,
      available: lab.capacity,
      allocated: [],
    }));
  
    const resetGroups = studentGroups.map((group) => ({
      ...group,
      allocated: false,
      session: null,
    }));
  
    const sortedLabs = [...resetLabs].sort((a, b) => b.capacity - a.capacity);
    
    const sortedGroups = [...resetGroups].sort((a, b) => b.count - a.count);
  
    const findDepartmentGroupForDept = (dept) => {
      return (
        departmentGroups.find((group) =>
          group.departments.some((d) => dept.includes(d))
        )?.name || dept
      );
    };
  
   
    let remainingGroups = [...sortedGroups];
    const allSessionResults = [];
    let currentSession = 0;
    
    
    while (remainingGroups.length > 0) {
      const sessionResults = [];
      const usedLabsThisSession = new Set();
      const groupsAllocatedThisSession = new Set();
      
      
      const groupsByYear = {};
      remainingGroups.forEach((group) => {
        if (!groupsByYear[group.year]) {
          groupsByYear[group.year] = [];
        }
        groupsByYear[group.year].push(group);
      });
  
      
      Object.keys(groupsByYear).forEach((year) => {
        const yearGroups = groupsByYear[year];
  
        
        const groupsByDeptGroup = {};
        yearGroups.forEach((group) => {
          const deptGroupName = findDepartmentGroupForDept(group.departments);
          if (!groupsByDeptGroup[deptGroupName]) {
            groupsByDeptGroup[deptGroupName] = [];
          }
          groupsByDeptGroup[deptGroupName].push(group);
        });
  

        Object.keys(groupsByDeptGroup).forEach((deptGroup) => {
          const deptGroups = groupsByDeptGroup[deptGroup];

          const availableLabs = sortedLabs.filter(
            (lab) => !usedLabsThisSession.has(lab.id)
          );
  
          if (availableLabs.length === 0) {
            return;
          }
  
          let currentLab = null;
          let remainingCapacity = 0;
  
          deptGroups.forEach((group) => {
            if (!currentLab || remainingCapacity < group.count) {
              const suitableLab = availableLabs.find(
                (lab) => 
                  !usedLabsThisSession.has(lab.id) && 
                  lab.capacity >= group.count
              );
  
              if (suitableLab) {
                currentLab = suitableLab;
                remainingCapacity = currentLab.capacity;
                usedLabsThisSession.add(currentLab.id);
                sessionResults.push({
                  labId: currentLab.id,
                  labName: currentLab.name,
                  year: year,
                  departmentGroup: deptGroup,
                  allocatedGroups: [],
                });
              } else {
                return;
              }
            }
  
            if (remainingCapacity >= group.count) {
              const allocationEntry = sessionResults.find(
                (a) =>
                  a.labId === currentLab.id &&
                  a.year === year &&
                  a.departmentGroup === deptGroup
              );
  
              if (allocationEntry) {
                allocationEntry.allocatedGroups.push({
                  id: group.id,
                  departments: group.departments,
                  section: group.section,
                  count: group.count,
                });
  
                remainingCapacity -= group.count;
                group.allocated = true;
                group.session = currentSession + 1;
                groupsAllocatedThisSession.add(group.id);
              }
            }
          });
        });
      });
  
      if (sessionResults.length > 0) {
        allSessionResults.push(sessionResults);
        currentSession++;
      }
  
      remainingGroups = remainingGroups.filter(
        (group) => !groupsAllocatedThisSession.has(group.id)
      );
      if (groupsAllocatedThisSession.size === 0 && remainingGroups.length > 0) {
        break;
      }
    }
    
    setSessionAllocations(allSessionResults);
    setUnallocatedGroups(remainingGroups);
  
    if (remainingGroups.length > 0) {
      setError(
        `Warning: ${remainingGroups.length} groups could not be allocated in any session`
      );
    } else {
      setSuccess("All groups have been successfully allocated");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setLabs([]);
      setStudentGroups([]);
      setDepartmentGroups([]);
      setSessionAllocations([]);
      setUnallocatedGroups([]);
      setError("");
      setSuccess("All data cleared");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lab Allocation System</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 mr-2 ${
            activeTab === "labs"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("labs")}
        >
          Labs
        </button>
        <button
          className={`py-2 px-4 mr-2 ${
            activeTab === "deptGroups"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("deptGroups")}
        >
          Department Groups
        </button>
        <button
          className={`py-2 px-4 mr-2 ${
            activeTab === "groups"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("groups")}
        >
          Student Groups
        </button>
        <button
          className={`py-2 px-4 mr-2 ${
            activeTab === "allocate"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("allocate")}
        >
          Allocate
        </button>
      </div>

      {activeTab === "labs" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Labs</h2>

          <form onSubmit={handleAddLab} className="mb-6 bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="labName">
                  Lab Name
                </label>
                <input
                  type="text"
                  id="labName"
                  value={labInput.name}
                  onChange={(e) =>
                    setLabInput({ ...labInput, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Computer Lab 1"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="labCapacity"
                >
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  id="labCapacity"
                  value={labInput.capacity}
                  onChange={(e) =>
                    setLabInput({ ...labInput, capacity: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Lab
                </button>
              </div>
            </div>
          </form>

          {labs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Lab Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Capacity
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab) => (
                    <tr key={lab.id}>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {lab.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {lab.capacity}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleRemoveLab(lab.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              <p>No labs added yet. Please add labs using the form above.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "deptGroups" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Manage Department Groups
          </h2>

          <form
            onSubmit={handleAddDepartmentGroup}
            className="mb-6 bg-gray-50 p-4 rounded"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="deptGroupName"
                >
                  Group Name
                </label>
                <input
                  type="text"
                  id="deptGroupName"
                  value={departmentGroupInput.name}
                  onChange={(e) =>
                    setDepartmentGroupInput({
                      ...departmentGroupInput,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., Engineering Group"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="deptGroupDepts"
                >
                  Departments (comma separated)
                </label>
                <input
                  type="text"
                  id="deptGroupDepts"
                  value={departmentGroupInput.departments}
                  onChange={(e) =>
                    setDepartmentGroupInput({
                      ...departmentGroupInput,
                      departments: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., CSE, IT, AIDS"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Department Group
                </button>
              </div>
            </div>
          </form>

          {departmentGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Group Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Departments
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentGroups.map((group) => (
                    <tr key={group.id}>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.departments.join(", ")}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleRemoveDepartmentGroup(group.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              <p>
                No department groups added yet. Please add groups using the form
                above.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "groups" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Student Groups</h2>

          <form
            onSubmit={handleAddGroup}
            className="mb-6 bg-gray-50 p-4 rounded"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="studentYear"
                >
                  Year
                </label>
                <select
                  id="studentYear"
                  value={groupInput.year}
                  onChange={(e) =>
                    setGroupInput({ ...groupInput, year: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="studentDepts"
                >
                  Departments (comma separated)
                </label>
                <input
                  type="text"
                  id="studentDepts"
                  value={groupInput.departments}
                  onChange={(e) =>
                    setGroupInput({
                      ...groupInput,
                      departments: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., CSE, IT, AIDS"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="studentSection"
                >
                  Section
                </label>
                <input
                  type="text"
                  id="studentSection"
                  value={groupInput.section}
                  onChange={(e) =>
                    setGroupInput({ ...groupInput, section: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  placeholder="e.g., A"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="studentCount"
                >
                  Student Count
                </label>
                <input
                  type="number"
                  id="studentCount"
                  value={groupInput.count}
                  onChange={(e) =>
                    setGroupInput({ ...groupInput, count: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Student Group
                </button>
              </div>
            </div>
          </form>

          {studentGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Year
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Departments
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Section
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Student Count
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentGroups.map((group) => (
                    <tr key={group.id}>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.year}st Year
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.departments}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.section}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {group.count}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleRemoveGroup(group.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              <p>
                No student groups added yet. Please add groups using the form
                above.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "allocate" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Lab Allocation</h2>

          <div className="mb-6">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={allocateStudents}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Run Allocation
              </button>

              <button
                onClick={handleClearAll}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Clear All Data
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Lab Summary</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p>Total Labs: {labs.length}</p>
                  <p>
                    Total Capacity:{" "}
                    {labs.reduce((sum, lab) => sum + lab.capacity, 0)} seats
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Student Summary</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p>Total Groups: {studentGroups.length}</p>
                  <p>
                    Total Students:{" "}
                    {studentGroups.reduce((sum, group) => sum + group.count, 0)}
                  </p>
                  <p>
                    1st Year:{" "}
                    {studentGroups
                      .filter((g) => g.year === "1")
                      .reduce((sum, group) => sum + group.count, 0)}{" "}
                    students
                  </p>
                  <p>
                    2nd Year:{" "}
                    {studentGroups
                      .filter((g) => g.year === "2")
                      .reduce((sum, group) => sum + group.count, 0)}{" "}
                    students
                  </p>
                  <p>
                    3rd Year:{" "}
                    {studentGroups
                      .filter((g) => g.year === "3")
                      .reduce((sum, group) => sum + group.count, 0)}{" "}
                    students
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Display allocations for all sessions */}
          {sessionAllocations.map(
            (sessionAllocation, sessionIndex) =>
              sessionAllocation.length > 0 && (
                <div className="mb-6" key={`session-${sessionIndex}`}>
                  <h3 className="font-medium mb-2">
                    {sessionIndex === 0
                      ? "First"
                      : sessionIndex === 1
                      ? "Second"
                      : sessionIndex === 2
                      ? "Third"
                      : `${sessionIndex + 1}th`}{" "}
                    Session Allocation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessionAllocation.map((allocation, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden shadow-sm"
                      >
                        <div
                          className="p-4 border-b"
                          style={{
                            backgroundColor:
                              sessionIndex === 0
                                ? "#ebf5ff"
                                : sessionIndex === 1
                                ? "#ebfff0"
                                : sessionIndex === 2
                                ? "#f5ebff"
                                : `hsl(${(sessionIndex * 60) % 360}, 70%, 95%)`,
                          }}
                        >
                          <h4 className="font-medium">{allocation.labName}</h4>
                          <p className="text-sm text-gray-600">
                            Year {allocation.year} -{" "}
                            {allocation.departmentGroup}
                          </p>
                        </div>

                        <div className="p-4">
                          <h5 className="font-medium mb-2">
                            Allocated Groups:
                          </h5>
                          <ul className="list-disc list-inside">
                            {allocation.allocatedGroups.map((group) => (
                              <li key={group.id}>
                                {group.departments} (Section {group.section}) -{" "}
                                {group.count} students
                              </li>
                            ))}
                          </ul>

                          <p className="mt-2 text-sm text-gray-600">
                            Total Students:{" "}
                            {allocation.allocatedGroups.reduce(
                              (sum, g) => sum + g.count,
                              0
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

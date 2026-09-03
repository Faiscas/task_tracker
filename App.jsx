import { useEffect, useState } from "react";
import { BarChart3, FileOutput, LayoutDashboard, Moon, Plus, ServerCog, Sun, PanelsTopLeft } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Charts from "./components/Charts";
import TaskForm from "./components/TaskForm";
import TaskTable from "./components/TaskTable";
import Reports from "./components/Reports";
import Kanban, { DEFAULT_COLUMNS } from "./components/Kanban";
import Backlog from "./components/Backlog";
import BoardList from "./components/BoardList";
import McpSettings from "./components/McpSettings";


function App() {
    const STORAGE_KEY = "tracker_v2";
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeView, setActiveView] = useState("overview");
    const [boards, setBoards] = useState([{ id: "default-board", name: "My board", items: [], columns: DEFAULT_COLUMNS }]);
    const [selectedBoardId, setSelectedBoardId] = useState("default-board");
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [isAddingIssue, setIsAddingIssue] = useState(false);
    const [mcpServers, setMcpServers] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setTasks(parsed.tasks || []);
            setActiveTask(parsed.activeTask || null);
            setDarkMode(parsed.darkMode || false);
            setMcpServers(parsed.mcpServers || []);
            const rawBoards = parsed.boards?.length ? parsed.boards : [{
                id: "default-board",
                name: "My board",
                items: parsed.boardItems || [],
                columns: parsed.boardColumns?.length ? parsed.boardColumns : DEFAULT_COLUMNS,
            }];
            const savedBoards = rawBoards.map(board => ({
                ...board,
                columns: (board.columns?.length ? board.columns : DEFAULT_COLUMNS).map(column => column.id === "backlog" ? { ...column, label: "TODO" } : column),
            }));
            setBoards(savedBoards);
            setSelectedBoardId(savedBoards[0].id);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const backup = { tasks, activeTask, darkMode, boards, mcpServers, backedUpAt: new Date().toISOString() };
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(backup)
        );
        localStorage.setItem("tracker_v2_backup", JSON.stringify(backup));
    }, [tasks, activeTask, darkMode, boards, mcpServers, isHydrated]);

    const selectedBoard = boards.find(board => board.id === selectedBoardId);
    const setBoardItems = updater => setBoards(currentBoards => currentBoards.map(board => board.id === selectedBoardId ? { ...board, items: typeof updater === "function" ? updater(board.items) : updater } : board));
    const setBoardColumns = updater => setBoards(currentBoards => currentBoards.map(board => board.id === selectedBoardId ? { ...board, columns: typeof updater === "function" ? updater(board.columns) : updater } : board));
    const createBoard = name => {
        const board = { id: crypto.randomUUID(), name, items: [], columns: DEFAULT_COLUMNS };
        setBoards(currentBoards => [...currentBoards, board]);
    };
    const openBoard = boardId => { setSelectedBoardId(boardId); setActiveView("kanban"); };
    const renameBoard = (boardId, name) => setBoards(currentBoards => currentBoards.map(board => board.id === boardId ? { ...board, name } : board));
    const deleteBoard = boardId => {
        setBoards(currentBoards => currentBoards.filter(board => board.id !== boardId));
        if (selectedBoardId === boardId) setActiveView("boards");
    };
    const createBacklogIssue = (boardId, issue) => {
        const { boardId: ignoredBoardId, boardName, ...issueData } = issue;
        setBoards(currentBoards => currentBoards.map(board => board.id === boardId ? { ...board, items: [...board.items, { ...issueData, id: crypto.randomUUID(), status: null }] } : board));
    };
    const updateBacklogIssue = (sourceBoardId, targetBoardId, issue) => {
        const { boardId: ignoredBoardId, boardName, ...issueData } = issue;
        setBoards(currentBoards => currentBoards.map(board => {
            if (board.id === sourceBoardId && board.id === targetBoardId) return { ...board, items: board.items.map(item => item.id === issue.id ? issueData : item) };
            if (board.id === sourceBoardId) return { ...board, items: board.items.filter(item => item.id !== issue.id) };
            if (board.id === targetBoardId) return { ...board, items: [...board.items, issueData] };
            return board;
        }));
    };
    const deleteBacklogIssue = (boardId, issueId) => setBoards(currentBoards => currentBoards.map(board => board.id === boardId ? { ...board, items: board.items.filter(item => item.id !== issueId) } : board));
    const saveMcpServer = server => setMcpServers(currentServers => currentServers.some(current => current.id === server.id) ? currentServers.map(current => current.id === server.id ? server : current) : [...currentServers, server]);
    const boardIssues = boards.flatMap(board => board.items.filter(item => item.status).map(item => ({ ...item, boardId: board.id, boardName: board.name })));
    const startKanbanIssue = issue => setBoards(currentBoards => currentBoards.map(board => {
        if (board.id !== issue.boardId) return board;
        const ongoingColumn = board.columns.find(column => column.label.toLowerCase() === "ongoing");
        const columns = ongoingColumn ? board.columns : [...board.columns, { id: "ongoing", label: "Ongoing", color: "#0969da" }];
        const ongoingStatus = ongoingColumn?.id || "ongoing";
        return { ...board, columns, items: board.items.map(item => item.id === issue.id ? { ...item, status: ongoingStatus } : item) };
    }));

    return (
        <div className={darkMode ? "app dark-mode" : "app"}>
            <div className="app-shell">
                <aside className="side-nav">
                    <div className="brand-mark">ET</div>
                    <nav aria-label="Main navigation">
                        <button className={activeView === "overview" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("overview")}><LayoutDashboard size={19} /> Overview</button>
                        <div className="kanban-nav-group">
                            <button className={activeView === "kanban" || activeView === "backlog" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("kanban")}><PanelsTopLeft size={19} /> Kanban</button>
                            <div className="kanban-subnav"><button onClick={() => setActiveView("backlog")}>Backlog</button><button onClick={() => setActiveView("boards")}>Boards</button></div>
                        </div>
                        <button className={activeView === "reports" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("reports")}><FileOutput size={19} /> Export reports</button>
                        <button className={activeView === "graphics" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("graphics")}><BarChart3 size={19} /> Graphics</button>
                        <button className={activeView === "mcp" ? "nav-item active" : "nav-item"} onClick={() => setActiveView("mcp")}><ServerCog size={19} /> MCP configuration</button>
                    </nav>
                </aside>
                <main className="app-content">
                    <header className="app-header">
                        <div>
                            <p className="eyebrow">PERSONAL TIMESHEET</p>
                            <h1>{activeView === "overview" ? "Engineering Productivity Tracker" : activeView === "backlog" ? "Issue Backlog" : activeView === "boards" ? "Project Boards" : activeView === "kanban" ? selectedBoard?.name || "Project Board" : activeView === "reports" ? "Export Reports" : activeView === "mcp" ? "MCP Configuration" : "Productivity Graphics"}</h1>
                        </div>
                        <div className="header-actions"><button className="icon-button" onClick={() => setDarkMode(currentMode => !currentMode)} title={darkMode ? "Use light mode" : "Use dark mode"} aria-label={darkMode ? "Use light mode" : "Use dark mode"}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>{activeView === "kanban" && <div className="board-header-actions"><button className="secondary-button add-status-button" onClick={() => setIsAddingColumn(true)}><Plus size={17} /> Add status</button><button className="secondary-button add-status-button" onClick={() => setIsAddingIssue(true)}><Plus size={17} /> Add issue</button></div>}</div>
                    </header>
                    {activeView === "overview" && <section className="overview-page">
                        <TaskForm activeTask={activeTask} setActiveTask={setActiveTask} setTasks={setTasks} boardIssues={boardIssues} onStartIssue={startKanbanIssue} />
                        <Dashboard tasks={tasks} />
                        <TaskTable tasks={tasks} setTasks={setTasks} />
                    </section>}
                    {activeView === "reports" && <Reports tasks={tasks} />}
                    {activeView === "graphics" && <section className="graphics-view"><Dashboard tasks={tasks} /><Charts tasks={tasks} /></section>}
                    {activeView === "mcp" && <McpSettings servers={mcpServers} onSave={saveMcpServer} onDelete={serverId => setMcpServers(currentServers => currentServers.filter(server => server.id !== serverId))} />}
                    {activeView === "boards" && <BoardList boards={boards} onCreate={createBoard} onOpen={openBoard} onDelete={deleteBoard} onRename={renameBoard} />}
                    {activeView === "backlog" && <Backlog boards={boards} onCreateIssue={createBacklogIssue} onUpdateIssue={updateBacklogIssue} onDeleteIssue={deleteBacklogIssue} />}
                    {activeView === "kanban" && selectedBoard && <Kanban boardItems={selectedBoard.items} setBoardItems={setBoardItems} boardColumns={selectedBoard.columns} setBoardColumns={setBoardColumns} isAddingColumn={isAddingColumn} setIsAddingColumn={setIsAddingColumn} isAddingIssue={isAddingIssue} setIsAddingIssue={setIsAddingIssue} />}
                </main>
            </div>
        </div>
    );

}

export default App;
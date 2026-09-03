import KPICards from "./KPICards";

export default function Dashboard({ tasks }) {
    return (
        <section className="dashboard">
            <KPICards tasks={tasks} />
        </section>
    );
}
import { ProjectStatus } from "@/types";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface ProjectStatusTrackerProps {
    status: ProjectStatus;
}

const ProjectStatusTracker = ({ status }: ProjectStatusTrackerProps) => {

    // Define the flow steps
    const steps = [
        { label: "Submitted", status: ProjectStatus.PENDING },
        { label: "Approved by Admin", status: ProjectStatus.OPEN },
        { label: "In Progress", status: ProjectStatus.IN_PROGRESS },
        { label: "Review", status: ProjectStatus.REVIEW },
        { label: "Completed", status: ProjectStatus.COMPLETED },
    ];

    // Determine current step index
    // Note: This logic assumes linear progression. 
    // If status is OPEN, it's step 1 (0-indexed). 
    // If PENDING, step 0.

    let currentStepIndex = 0;
    if (status === ProjectStatus.OPEN) currentStepIndex = 1;
    if (status === ProjectStatus.IN_PROGRESS) currentStepIndex = 2;
    if (status === ProjectStatus.REVIEW) currentStepIndex = 3;
    if (status === ProjectStatus.COMPLETED) currentStepIndex = 4;

    if (status === ProjectStatus.REJECTED) {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-md w-full">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Project Rejected</span>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-center justify-between relative px-2 min-w-[300px]">
                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-[14px] w-full h-1 bg-slate-700 -z-10" />

                {/* Connecting Line - Active Progress */}
                <div
                    className="absolute left-0 top-[14px] h-1 bg-green-500 -z-10 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={index} className="flex flex-col items-center z-10 w-16">
                            <div className="bg-slate-900 rounded-full p-1"> {/* Wrapper for background behind icon */}
                                {isCompleted ? (
                                    <CheckCircle2 className={`w-6 h-6 ${isCurrent ? 'text-green-400 scale-110' : 'text-green-500'} bg-slate-900 rounded-full`} />
                                ) : (
                                    <Circle className="w-6 h-6 text-slate-600 bg-slate-900 rounded-full" />
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium text-center leading-tight break-words w-full ${isCurrent ? 'text-green-400' : 'text-slate-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-slate-400">
                    Current Status: <span className="font-semibold text-slate-200">{status}</span>
                </p>
                {status === ProjectStatus.PENDING && <p className="text-xs text-slate-500">Waiting for admin approval...</p>}
                {status === ProjectStatus.OPEN && <p className="text-xs text-blue-400">Visible to developers! Applications arriving...</p>}
            </div>
        </div>
    );
};

export default ProjectStatusTracker;

import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../app/principal/dashboard/DashBoard";
import "@testing-library/jest-dom";

// Mock API calls
global.fetch = jest.fn((url) => {
    if (url.includes("/principals/fetch")) {
        return Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    principal: {
                        fullName: "Principal Skinner",
                        school: { _id: "school1", name: "Springfield Elementary" },
                    },
                }),
        });
    }
    if (url.includes("/stats")) {
        return Promise.resolve({
            json: () =>
                Promise.resolve({
                    success: true,
                    stats: {
                        classes: 5,
                        sections: 10,
                        teachers: 15,
                        students: 200,
                    },
                }),
        });
    }
    return Promise.resolve({ ok: false });
}) as jest.Mock;

describe("DashboardPage Component", () => {
    it("renders principal info and stats", async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText("Welcome, Principal Skinner")).toBeInTheDocument();
            expect(screen.getByText("Springfield Elementary")).toBeInTheDocument();
            expect(screen.getByText("200")).toBeInTheDocument(); // Students count
        });
    });
});

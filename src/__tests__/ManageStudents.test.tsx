import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ManageStudents from "../app/principal/manage-students/ManageStudents";
import "@testing-library/jest-dom";

// Mock API calls
global.fetch = jest.fn((url) => {
    if (url.includes("/students")) {
        return Promise.resolve({
            json: () =>
                Promise.resolve({
                    success: true,
                    students: [
                        {
                            _id: "1",
                            fullName: "John Doe",
                            username: "john",
                            email: "john@example.com",
                            section: { _id: "s1", name: "A", classId: { grade: 10 } },
                            isActive: true,
                        },
                    ],
                    totalStudents: 1,
                }),
        });
    }
    if (url.includes("/classes")) {
        return Promise.resolve({
            json: () => Promise.resolve({ classes: [{ _id: "c1", grade: 10 }] }),
        });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
}) as jest.Mock;

describe("ManageStudents Component", () => {
    it("renders the component and fetches students", async () => {
        render(<ManageStudents />);

        expect(screen.getByText("Loading students...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Class 10 - Sec A")).toBeInTheDocument();
        });
    });

    it("opens add student modal", () => {
        render(<ManageStudents />);
        const addBtn = screen.getByText("Add Student");
        fireEvent.click(addBtn);
        expect(screen.getByText("Create Student")).toBeInTheDocument();
    });
});

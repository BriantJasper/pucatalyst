import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import {
    User,
    Briefcase,
    BookOpen,
    Award,
    FileText,
    Save,
    Upload,
    Building2,
    ScrollText,
    Plus,
    X,
} from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import LoadingAnimation from "../components/ui/LoadingAnimation";

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [currentResume, setCurrentResume] = useState(null);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

    // Organizations & Certificates State
    const [organizations, setOrganizations] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [availableCertificates, setAvailableCertificates] = useState([]);
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    // Watch slider values for display
    const hardSkills = watch("skill_assessment.hard_skills", 0);
    const softSkills = watch("skill_assessment.soft_skills", 0);
    const experience = watch("skill_assessment.experience", 0);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get("/auth/me");
            const userData = response.data;
            setUser(userData);

            // Fetch student details
            // Assuming the user ID is needed or we have a specific endpoint for current student profile
            // For now, let's try fetching student data using the user ID if available,
            // or we might need an endpoint like /api/students/me if implemented,
            // but based on controller we have show(id) which takes user_id.

            const studentResponse = await axios.get(`/students/${userData.id}`);
            const studentData = studentResponse.data;

            // Pre-fill form
            setValue("name", userData.name);
            setValue("student_id", studentData.student_id);
            setValue("major", studentData.major);
            setValue("year", studentData.year);
            setValue("gpa", studentData.gpa);
            setValue("career_goal", studentData.career_goal);
            setValue("bio", studentData.bio);
            setCurrentResume(studentData.resume_path);

            // Handle JSON fields
            if (studentData.interests) {
                // Assuming interests is stored as array
                // We might need a better UI for tags, but for now let's assume comma separated string for input or similar
                // For this implementation, let's use a multi-select or just text for simplicity first,
                // but the requirement asked for "Interest Tags".
                // Let's store them as an array in form state.
                setValue("interests", studentData.interests);
                setSelectedInterests(studentData.interests);
            }

            if (studentData.skill_assessment) {
                setValue(
                    "skill_assessment.hard_skills",
                    studentData.skill_assessment.hard_skills || 0
                );
                setValue(
                    "skill_assessment.soft_skills",
                    studentData.skill_assessment.soft_skills || 0
                );
                setValue(
                    "skill_assessment.experience",
                    studentData.skill_assessment.experience || 0
                );
            }

            if (studentData.skill_assessment) {
                setValue(
                    "skill_assessment.hard_skills",
                    studentData.skill_assessment.hard_skills || 0
                );
                setValue(
                    "skill_assessment.soft_skills",
                    studentData.skill_assessment.soft_skills || 0
                );
                setValue(
                    "skill_assessment.experience",
                    studentData.skill_assessment.experience || 0
                );
            }

            // Set Organizations and Certificates
            setOrganizations(studentData.organizations || []);
            setCertificates(studentData.certificates || []);

            // Fetch available options
            const orgsResponse = await axios.get("/organizations");
            setAvailableOrganizations(orgsResponse.data);

            const certsResponse = await axios.get("/certificates");
            setAvailableCertificates(certsResponse.data);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile data");
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!user) {
            toast.error("User data not loaded");
            return;
        }
        try {
            // Update profile
            await axios.put(`/students/${user.id}`, {
                ...data,
                // Ensure interests is sent as array if we use a tag input,
                // or if we use checkboxes.
                // For now, let's assume data.interests is already in correct format or needs processing.
            });

            // Upload resume if selected
            if (resumeFile) {
                const formData = new FormData();
                formData.append("resume", resumeFile);
                await axios.post(
                    `/students/${user.id}/upload-resume`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                // Update current resume display
                setCurrentResume(resumeFile.name); // Or fetch updated profile
                setResumeFile(null); // Reset file input
            }

            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
        }
    };

    // Interest options
    const interestOptions = [
        "UI/UX",
        "Robotics",
        "Business",
        "Cybersecurity",
        "Cloud Computing",
        "Content Creation",
        "Leadership",
        "Community Development",
        "Research",
        "Data Science",
        "AI/ML",
        "Web Development",
    ];

    const [selectedInterests, setSelectedInterests] = useState([]);

    // Sync selectedInterests with form
    useEffect(() => {
        setValue("interests", selectedInterests);
    }, [selectedInterests, setValue]);

    // Removed conflicting useEffect that caused infinite loop

    const toggleInterest = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(
                selectedInterests.filter((i) => i !== interest)
            );
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    // Organization Handlers
    const handleJoinOrg = async (orgId) => {
        try {
            const response = await axios.post(
                `/students/${user.id}/organizations`,
                { organization_id: orgId }
            );
            setOrganizations(response.data.student.organizations);
            toast.success("Joined organization successfully!");
            setIsOrgModalOpen(false);
        } catch (error) {
            console.error("Error joining organization:", error);
            toast.error("Failed to join organization");
        }
    };

    const handleLeaveOrg = async (orgId) => {
        if (!confirm("Are you sure you want to leave this organization?"))
            return;
        try {
            const response = await axios.delete(
                `/students/${user.id}/organizations`,
                { data: { organization_id: orgId } }
            );
            setOrganizations(response.data.student.organizations);
            toast.success("Left organization successfully!");
        } catch (error) {
            console.error("Error leaving organization:", error);
            toast.error("Failed to leave organization");
        }
    };

    // Certificate Handlers
    const handleAddCert = async (certId) => {
        try {
            const response = await axios.post(
                `/students/${user.id}/certificates`,
                { certificate_id: certId }
            );
            setCertificates(response.data.student.certificates);
            toast.success("Added certificate successfully!");
            setIsCertModalOpen(false);
        } catch (error) {
            console.error("Error adding certificate:", error);
            toast.error("Failed to add certificate");
        }
    };

    const handleRemoveCert = async (certId) => {
        if (!confirm("Are you sure you want to remove this certificate?"))
            return;
        try {
            const response = await axios.delete(
                `/students/${user.id}/certificates`,
                { data: { certificate_id: certId } }
            );
            setCertificates(response.data.student.certificates);
            toast.success("Removed certificate successfully!");
        } catch (error) {
            console.error("Error removing certificate:", error);
            toast.error("Failed to remove certificate");
        }
    };

    if (loading) return <LoadingAnimation />;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                        <div className="bg-indigo-600 px-8 py-6">
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <User className="w-8 h-8" />
                                Student Profile
                            </h1>
                            <p className="text-indigo-100 mt-2">
                                Manage your academic and professional journey
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="p-8 space-y-8"
                        >
                            {/* Personal Information */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            {...register("name")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Student ID
                                        </label>
                                        <input
                                            {...register("student_id")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="e.g. 12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Major
                                        </label>
                                        <input
                                            {...register("major", {
                                                required: true,
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Year
                                        </label>
                                        <select
                                            {...register("year")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="1">
                                                Freshman (Year 1)
                                            </option>
                                            <option value="2">
                                                Sophomore (Year 2)
                                            </option>
                                            <option value="3">
                                                Junior (Year 3)
                                            </option>
                                            <option value="4">
                                                Senior (Year 4)
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GPA (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4.00"
                                            {...register("gpa")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Career Goals */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-600" />
                                    Career Goals & Interests
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Career Goal
                                        </label>
                                        <select
                                            {...register("career_goal")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="">
                                                Select a career path...
                                            </option>
                                            <option value="Web Developer">
                                                Web Developer
                                            </option>
                                            <option value="Data Analyst">
                                                Data Analyst
                                            </option>
                                            <option value="Product Manager">
                                                Product Manager
                                            </option>
                                            <option value="HR Specialist">
                                                HR Specialist
                                            </option>
                                            <option value="Lawyer">
                                                Lawyer
                                            </option>
                                            <option value="Cybersecurity Analyst">
                                                Cybersecurity Analyst
                                            </option>
                                            <option value="UX Designer">
                                                UX Designer
                                            </option>
                                            <option value="Researcher">
                                                Researcher
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Interest Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map((interest) => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleInterest(interest)
                                                    }
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                        selectedInterests.includes(
                                                            interest
                                                        )
                                                            ? "bg-indigo-600 text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Skill Assessment */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                    Skill Assessment
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Hard Skills Proficiency
                                            </label>
                                            <span className="text-sm text-indigo-600 font-semibold">
                                                {hardSkills}/5
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="1"
                                            {...register(
                                                "skill_assessment.hard_skills"
                                            )}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Soft Skills Proficiency
                                            </label>
                                            <span className="text-sm text-indigo-600 font-semibold">
                                                {softSkills}/5
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="1"
                                            {...register(
                                                "skill_assessment.soft_skills"
                                            )}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Experience Level
                                            </label>
                                            <span className="text-sm text-indigo-600 font-semibold">
                                                {experience}/5
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="1"
                                            {...register(
                                                "skill_assessment.experience"
                                            )}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Resume Upload */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    Resume
                                </h2>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleResumeChange}
                                    />
                                    <label
                                        htmlFor="resume-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {resumeFile ? (
                                                resumeFile.name
                                            ) : currentResume ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setIsResumeModalOpen(
                                                            true
                                                        );
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline z-10 relative"
                                                >
                                                    Current:{" "}
                                                    {currentResume
                                                        .split("/")
                                                        .pop()}
                                                </button>
                                            ) : (
                                                "Click to upload your resume (PDF, DOCX)"
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">
                                            AI will scan this to extract skills
                                        </span>
                                    </label>
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Organizations */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                        Organizations
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsOrgModalOpen(true)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Organization
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {organizations.length > 0 ? (
                                        organizations.map((org) => (
                                            <div
                                                key={org.id}
                                                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {org.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {org.role || "Member"}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleLeaveOrg(org.id)
                                                    }
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Leave
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">
                                            No organizations joined yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <hr className="border-gray-200" />

                            {/* Certificates */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <ScrollText className="w-5 h-5 text-indigo-600" />
                                        Certificates
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsCertModalOpen(true)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Certificate
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {certificates.length > 0 ? (
                                        certificates.map((cert) => (
                                            <div
                                                key={cert.id}
                                                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {cert.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {cert.provider}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveCert(
                                                            cert.id
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">
                                            No certificates added yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Resume Preview Modal */}
            {isResumeModalOpen && currentResume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Resume Preview
                            </h3>
                            <button
                                onClick={() => setIsResumeModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <span className="sr-only">Close</span>
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 bg-gray-100 overflow-hidden relative">
                            {currentResume.toLowerCase().endsWith(".pdf") ? (
                                <iframe
                                    src={`/storage/${currentResume}`}
                                    className="w-full h-full"
                                    title="Resume Preview"
                                />
                            ) : (
                                <iframe
                                    src={`https://docs.google.com/gview?url=${window.location.origin}/storage/${currentResume}&embedded=true`}
                                    className="w-full h-full"
                                    title="Resume Preview"
                                />
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <a
                                href={`/storage/${currentResume}`}
                                download
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Download Original File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Organization Modal */}
            {isOrgModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Join Organization
                            </h3>
                            <button
                                onClick={() => setIsOrgModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {availableOrganizations.map((org) => (
                                    <div
                                        key={org.id}
                                        className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {org.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {org.category}
                                            </p>
                                        </div>
                                        {!organizations.find(
                                            (o) => o.id === org.id
                                        ) ? (
                                            <button
                                                onClick={() =>
                                                    handleJoinOrg(org.id)
                                                }
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                Join
                                            </button>
                                        ) : (
                                            <span className="text-green-600 text-sm font-medium">
                                                Joined
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificate Modal */}
            {isCertModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Add Certificate
                            </h3>
                            <button
                                onClick={() => setIsCertModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {availableCertificates.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {cert.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {cert.provider}
                                            </p>
                                        </div>
                                        {!certificates.find(
                                            (c) => c.id === cert.id
                                        ) ? (
                                            <button
                                                onClick={() =>
                                                    handleAddCert(cert.id)
                                                }
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <span className="text-green-600 text-sm font-medium">
                                                Added
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

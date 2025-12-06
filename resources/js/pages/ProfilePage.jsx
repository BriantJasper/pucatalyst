import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "../lib/axios";
import { useToast } from "../hooks/use-toast";
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
    Shield,
    Lock,
    Eye,
    EyeOff,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import FaceAuthSettings from "../components/FaceAuthSettings";
import StarryBackground from "../components/StarryBackground";
import { useAuthStore } from "../store/authStore";

const ProfilePage = () => {
    const { user: authUser, setAuth } = useAuthStore();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");
    const [resumeFile, setResumeFile] = useState(null);
    const [currentResume, setCurrentResume] = useState(null);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

    // Password change state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

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
            setAuth(userData, localStorage.getItem("access_token"));

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
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile data");
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

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        setAuth(updatedUser, localStorage.getItem("access_token"));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (
            passwordData.new_password !== passwordData.new_password_confirmation
        ) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.post("/auth/change-password", passwordData);
            toast.success("Password changed successfully!");
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to change password";
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            toast.error("Please type DELETE to confirm");
            return;
        }

        setDeleteLoading(true);
        try {
            await axios.delete("/auth/delete-account");
            toast.success("Account deleted successfully");

            // Clear auth and redirect to home
            localStorage.removeItem("access_token");
            setAuth(null, null);
            window.location.href = "/";
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to delete account";
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
            <StarryBackground />
            <div className="relative z-10">
                <Navbar />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        {/* <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Settings
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your profile and account settings
                        </p>
                    </div> */}

                        {/* Tabs */}
                        <div className="flex border-b border-white/10 mb-6 bg-white/5 backdrop-blur-sm rounded-t-xl overflow-hidden animate-fade-up">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`px-6 py-4 font-bold transition-all relative flex-1 md:flex-none ${
                                    activeTab === "profile"
                                        ? "bg-primary/20 text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <User className="w-5 h-5" />
                                    Profile
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`px-6 py-4 font-bold transition-all relative flex-1 md:flex-none ${
                                    activeTab === "security"
                                        ? "bg-primary/20 text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Security
                                </div>
                            </button>
                        </div>

                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="glass-card rounded-b-xl rounded-tr-xl overflow-hidden animate-fade-up stagger-1 border border-white/10">
                                <div className="bg-white/5 px-8 py-6 border-b border-white/10">
                                    <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
                                        <User className="w-8 h-8 text-primary" />
                                        Student Profile
                                    </h1>
                                    <p className="text-muted-foreground mt-2 font-medium">
                                        Manage your academic and professional
                                        journey
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="p-8 space-y-8"
                                >
                                    <section>
                                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                            Personal Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    Full Name
                                                </label>
                                                <input
                                                    {...register("name")}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    Student ID
                                                </label>
                                                <input
                                                    {...register("student_id")}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                    placeholder="e.g. 12345678"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    Major
                                                </label>
                                                <input
                                                    {...register("major", {
                                                        required: true,
                                                    })}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    Year
                                                </label>
                                                <select
                                                    {...register("year")}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                >
                                                    <option
                                                        value="1"
                                                        className="bg-black"
                                                    >
                                                        Freshman (Year 1)
                                                    </option>
                                                    <option
                                                        value="2"
                                                        className="bg-black"
                                                    >
                                                        Sophomore (Year 2)
                                                    </option>
                                                    <option
                                                        value="3"
                                                        className="bg-black"
                                                    >
                                                        Junior (Year 3)
                                                    </option>
                                                    <option
                                                        value="4"
                                                        className="bg-black"
                                                    >
                                                        Senior (Year 4)
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    GPA (Optional)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4.00"
                                                    {...register("gpa")}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <hr className="border-white/10" />

                                    {/* Career Goals */}
                                    <section>
                                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-primary" />
                                            Career Goals & Interests
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-1">
                                                    Career Goal
                                                </label>
                                                <select
                                                    {...register("career_goal")}
                                                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-white"
                                                >
                                                    <option
                                                        value=""
                                                        className="bg-black"
                                                    >
                                                        Select a career path...
                                                    </option>
                                                    <option
                                                        value="Web Developer"
                                                        className="bg-black"
                                                    >
                                                        Web Developer
                                                    </option>
                                                    <option
                                                        value="Data Analyst"
                                                        className="bg-black"
                                                    >
                                                        Data Analyst
                                                    </option>
                                                    <option
                                                        value="Product Manager"
                                                        className="bg-black"
                                                    >
                                                        Product Manager
                                                    </option>
                                                    <option
                                                        value="HR Specialist"
                                                        className="bg-black"
                                                    >
                                                        HR Specialist
                                                    </option>
                                                    <option
                                                        value="Lawyer"
                                                        className="bg-black"
                                                    >
                                                        Lawyer
                                                    </option>
                                                    <option
                                                        value="Cybersecurity Analyst"
                                                        className="bg-black"
                                                    >
                                                        Cybersecurity Analyst
                                                    </option>
                                                    <option
                                                        value="UX Designer"
                                                        className="bg-black"
                                                    >
                                                        UX Designer
                                                    </option>
                                                    <option
                                                        value="Researcher"
                                                        className="bg-black"
                                                    >
                                                        Researcher
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-muted-foreground mb-2">
                                                    Interest Tags
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {interestOptions.map(
                                                        (interest) => (
                                                            <button
                                                                key={interest}
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleInterest(
                                                                        interest
                                                                    )
                                                                }
                                                                className={`px-3 py-1 rounded-full border border-white/10 text-sm font-bold transition-all ${
                                                                    selectedInterests.includes(
                                                                        interest
                                                                    )
                                                                        ? "bg-primary text-primary-foreground shadow-glow"
                                                                        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                                                }`}
                                                            >
                                                                {interest}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <hr className="border-white/10" />

                                    {/* Skill Assessment */}
                                    {/* <section>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                        Skill Assessment
                                    </h2>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-sm font-bold text-black">
                                                    Hard Skills Proficiency
                                                </label>
                                                <span className="text-sm text-black font-bold">
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
                                                className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-sm font-bold text-black">
                                                    Soft Skills Proficiency
                                                </label>
                                                <span className="text-sm text-black font-bold">
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
                                                className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-sm font-bold text-black">
                                                    Experience Level
                                                </label>
                                                <span className="text-sm text-black font-bold">
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
                                                className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                                            />
                                        </div>
                                    </div>
                                </section> */}

                                    <hr className="border-white/10" />

                                    {/* Resume Upload */}
                                    <section>
                                        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            Resume
                                        </h2>
                                        <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-all group cursor-pointer bg-black/20">
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
                                                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                                                <span className="text-sm font-bold text-foreground group-hover:text-white">
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
                                                            className="underline decoration-2 underline-offset-2 z-10 relative hover:text-primary"
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
                                                <span className="text-xs text-muted-foreground group-hover:text-gray-300 mt-1 font-medium">
                                                    AI will scan this to extract
                                                    skills
                                                </span>
                                            </label>
                                        </div>
                                    </section>

                                    <hr className="border-white/10" />

                                    {/* Organizations */}
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-primary" />
                                                Organizations
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsOrgModalOpen(true)
                                                }
                                                className="text-sm bg-primary/20 text-primary px-3 py-1 font-bold flex items-center gap-1 border border-primary/30 rounded-lg hover:bg-primary hover:text-black transition-all"
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
                                                        className="flex justify-between items-center p-4 border border-white/10 rounded-lg bg-white/5"
                                                    >
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">
                                                                {org.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {org.role ||
                                                                    "Member"}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleLeaveOrg(
                                                                    org.id
                                                                )
                                                            }
                                                            className="text-red-400 hover:text-red-300 text-sm"
                                                        >
                                                            Leave
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground text-sm italic">
                                                    No organizations joined yet.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    <hr className="border-gray-200" />

                                    {/* Certificates */}
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                <ScrollText className="w-5 h-5 text-primary" />
                                                Certificates
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCertModalOpen(true)
                                                }
                                                className="text-sm bg-primary/20 text-primary px-3 py-1 font-bold flex items-center gap-1 border border-primary/30 rounded-lg hover:bg-primary hover:text-black transition-all"
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
                                                        className="flex justify-between items-center p-4 border border-white/10 rounded-lg bg-white/5"
                                                    >
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">
                                                                {cert.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
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
                                                            className="text-red-400 hover:text-red-300 text-sm"
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
                                            className="bg-primary/20 text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-black border border-primary/30 transition-all flex items-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            Save Profile
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="space-y-6">
                                {/* Change Password Section */}
                                <div className="glass-card rounded-xl border border-white/10 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                Change Password
                                            </h2>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Update your password to keep
                                                your account secure
                                            </p>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handlePasswordChange}
                                        className="space-y-4"
                                    >
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={
                                                        showCurrentPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.current_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            current_password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-white"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <Eye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.new_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            new_password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                    minLength={8}
                                                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-white"
                                                    placeholder="Enter new password (min. 8 characters)"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <Eye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.new_password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            new_password_confirmation:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition text-white"
                                                    placeholder="Re-enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <Eye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="w-full bg-primary/20 text-primary py-3 rounded-lg font-bold hover:bg-primary hover:text-black border border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {passwordLoading
                                                ? "Changing Password..."
                                                : "Change Password"}
                                        </button>
                                    </form>
                                </div>

                                {/* Face Authentication Section */}
                                <FaceAuthSettings
                                    user={user}
                                    onUpdate={handleUserUpdate}
                                />

                                {/* Delete Account Section */}
                                <div className="glass-card rounded-xl border border-red-500/30 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/20">
                                            <Trash2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-red-400">
                                                Delete Account
                                            </h2>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Permanently remove your account
                                                and all data
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-red-300">
                                                <p className="font-medium mb-1">
                                                    Warning: This action cannot
                                                    be undone!
                                                </p>
                                                <ul className="space-y-1 text-red-300/80">
                                                    <li>
                                                        • Your profile and all
                                                        personal data will be
                                                        permanently deleted
                                                    </li>
                                                    <li>
                                                        • Your roadmaps,
                                                        progress, and
                                                        certificates will be
                                                        removed
                                                    </li>
                                                    <li>
                                                        • Your organization
                                                        memberships will be
                                                        cancelled
                                                    </li>
                                                    <li>
                                                        • You will be
                                                        immediately logged out
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="w-full bg-red-600/20 text-red-400 py-3 rounded-lg font-bold hover:bg-red-600 hover:text-white border border-red-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card rounded-xl border border-red-500/30 w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-600/20 rounded-lg border border-red-500/30">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-400 uppercase">
                                        Delete Account?
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-bold">
                                        This action is permanent and
                                        irreversible
                                    </p>
                                </div>
                            </div>

                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-300 font-medium mb-2">
                                    All of the following will be permanently
                                    deleted:
                                </p>
                                <ul className="text-sm text-red-300/80 space-y-1">
                                    <li>
                                        ✗ Your profile and account information
                                    </li>
                                    <li>
                                        ✗ All roadmaps and progress tracking
                                    </li>
                                    <li>✗ Certificates and achievements</li>
                                    <li>✗ Organization memberships</li>
                                    <li>✗ Skills assessment data</li>
                                    <li>✗ Face authentication data</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase">
                                    Type{" "}
                                    <span className="font-extrabold text-red-400 underline decoration-2">
                                        DELETE
                                    </span>{" "}
                                    to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) =>
                                        setDeleteConfirmText(e.target.value)
                                    }
                                    placeholder="Type DELETE"
                                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-white font-bold"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText("");
                                    }}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/10 rounded-lg font-bold hover:bg-white/20 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={
                                        deleteLoading ||
                                        deleteConfirmText !== "DELETE"
                                    }
                                    className="flex-1 px-4 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            Delete Forever
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Preview Modal */}
            {isResumeModalOpen && currentResume && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card rounded-xl border border-white/10 w-full max-w-5xl h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold uppercase text-foreground">
                                Resume Preview
                            </h3>
                            <button
                                onClick={() => setIsResumeModalOpen(false)}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 bg-black/30 overflow-hidden relative">
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
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <a
                                href={`/storage/${currentResume}`}
                                download
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Download Original File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Organization Modal */}
            {isOrgModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card rounded-xl border border-white/10 w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold uppercase text-foreground">
                                Join Organization
                            </h3>
                            <button
                                onClick={() => setIsOrgModalOpen(false)}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {availableOrganizations.map((org) => (
                                    <div
                                        key={org.id}
                                        className="flex justify-between items-center p-3 border border-white/10 rounded-lg hover:bg-white/5 transition"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {org.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
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
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                Join
                                            </button>
                                        ) : (
                                            <span className="text-green-400 text-sm font-medium">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card rounded-xl border border-white/10 w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                            <h3 className="text-lg font-bold uppercase text-foreground">
                                Add Certificate
                            </h3>
                            <button
                                onClick={() => setIsCertModalOpen(false)}
                                className="text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                                {availableCertificates.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="flex justify-between items-center p-3 border border-white/10 rounded-lg hover:bg-white/5 transition"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {cert.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
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
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <span className="text-green-400 text-sm font-medium">
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
            <Footer />
        </div>
    );
};

export default ProfilePage;

// Types for the roadmap data - easily swappable with API responses
export interface UserProfile {
    name: string;
    avatar?: string;
    careerGoal: string;
    major: string;
    year: string;
    completionPercentage: number;
}

export interface Skill {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    status: "completed" | "in-progress" | "upcoming";
    description: string;
    icon: string;
}

export interface Certification {
    id: string;
    name: string;
    provider: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    icon: string;
    url?: string;
}

export interface Organization {
    id: string;
    name: string;
    type: "club" | "organization" | "society";
    description: string;
    tags: string[];
    memberCount?: number;
    meetingFrequency?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    category: string;
    skills: string[];
    estimatedTime: string;
    status: "completed" | "in-progress" | "upcoming";
}

export interface Course {
    id: string;
    name: string;
    description: string;
    provider: string;
    category: string;
    duration: string;
    isFree: boolean;
    url: string;
    status: "completed" | "in-progress" | "upcoming";
}

// Mock data - replace with API calls
export const userData: UserProfile = {
    name: "User",
    careerGoal: "Full-Stack Software Engineer",
    major: "Computer Science",
    year: "Junior",
    completionPercentage: 45,
};

export const skillsData: Skill[] = [
    {
        id: "1",
        name: "HTML & CSS Fundamentals",
        level: "beginner",
        status: "completed",
        description:
            "Master semantic HTML and CSS styling including Flexbox and Grid",
        icon: "Code",
    },
    {
        id: "2",
        name: "JavaScript Essentials",
        level: "beginner",
        status: "completed",
        description: "Core JavaScript concepts including ES6+ features",
        icon: "Braces",
    },
    {
        id: "3",
        name: "React Development",
        level: "intermediate",
        status: "in-progress",
        description: "Build modern UIs with React, hooks, and state management",
        icon: "Atom",
    },
    {
        id: "4",
        name: "Node.js & Express",
        level: "intermediate",
        status: "upcoming",
        description: "Server-side development with Node.js and REST APIs",
        icon: "Server",
    },
    {
        id: "5",
        name: "Database Design",
        level: "intermediate",
        status: "upcoming",
        description: "SQL and NoSQL databases, data modeling, and optimization",
        icon: "Database",
    },
    {
        id: "6",
        name: "System Design",
        level: "advanced",
        status: "upcoming",
        description: "Design scalable and reliable distributed systems",
        icon: "Network",
    },
];

export const certificationsData: Certification[] = [
    {
        id: "1",
        name: "AWS Cloud Practitioner",
        provider: "Amazon Web Services",
        description:
            "Foundational understanding of AWS Cloud concepts, services, and terminology",
        difficulty: "beginner",
        estimatedTime: "20 hours",
        icon: "Cloud",
    },
    {
        id: "2",
        name: "Meta Front-End Developer",
        provider: "Meta",
        description:
            "Professional certificate covering HTML, CSS, JavaScript, and React",
        difficulty: "intermediate",
        estimatedTime: "7 months",
        icon: "Layout",
    },
    {
        id: "3",
        name: "Google UX Design",
        provider: "Google",
        description:
            "Learn the foundations of UX design and create wireframes and prototypes",
        difficulty: "beginner",
        estimatedTime: "6 months",
        icon: "Palette",
    },
    {
        id: "4",
        name: "MongoDB Developer",
        provider: "MongoDB University",
        description:
            "Master MongoDB for building modern applications with flexible data models",
        difficulty: "intermediate",
        estimatedTime: "12 hours",
        icon: "Database",
    },
];

export const organizationsData: Organization[] = [
    {
        id: "1",
        name: "ACM Student Chapter",
        type: "organization",
        description:
            "Association for Computing Machinery chapter focusing on tech talks, hackathons, and networking",
        tags: ["Programming", "Networking", "Hackathons"],
        memberCount: 150,
        meetingFrequency: "Weekly",
    },
    {
        id: "2",
        name: "Web Development Club",
        type: "club",
        description:
            "Build real-world web projects and learn modern frameworks together",
        tags: ["Web Dev", "React", "Node.js"],
        memberCount: 85,
        meetingFrequency: "Bi-weekly",
    },
    {
        id: "3",
        name: "Women in Tech Society",
        type: "society",
        description:
            "Empowering women in technology through mentorship and community",
        tags: ["Diversity", "Mentorship", "Community"],
        memberCount: 120,
        meetingFrequency: "Weekly",
    },
    {
        id: "4",
        name: "Open Source Contributors",
        type: "club",
        description:
            "Contribute to open source projects and learn collaborative development",
        tags: ["Open Source", "Git", "Collaboration"],
        memberCount: 60,
        meetingFrequency: "Monthly",
    },
];

export const projectsData: Project[] = [
    {
        id: "1",
        name: "Personal Portfolio Website",
        description:
            "Create a responsive portfolio showcasing your projects and skills",
        difficulty: "beginner",
        category: "Web Development",
        skills: ["HTML", "CSS", "JavaScript"],
        estimatedTime: "1 week",
        status: "completed",
    },
    {
        id: "2",
        name: "Task Management App",
        description:
            "Build a full-stack todo application with user authentication",
        difficulty: "intermediate",
        category: "Full Stack",
        skills: ["React", "Node.js", "MongoDB"],
        estimatedTime: "2 weeks",
        status: "in-progress",
    },
    {
        id: "3",
        name: "E-Commerce Platform",
        description:
            "Develop a complete online store with cart and payment integration",
        difficulty: "advanced",
        category: "Full Stack",
        skills: ["React", "Node.js", "PostgreSQL", "Stripe"],
        estimatedTime: "4 weeks",
        status: "upcoming",
    },
    {
        id: "4",
        name: "Real-Time Chat Application",
        description:
            "Create a chat app with WebSocket support and message history",
        difficulty: "intermediate",
        category: "Real-Time",
        skills: ["React", "Socket.io", "Node.js"],
        estimatedTime: "2 weeks",
        status: "upcoming",
    },
    {
        id: "5",
        name: "AI Content Generator",
        description: "Build an app that uses AI APIs to generate content",
        difficulty: "advanced",
        category: "AI/ML",
        skills: ["React", "Python", "OpenAI API"],
        estimatedTime: "3 weeks",
        status: "upcoming",
    },
];

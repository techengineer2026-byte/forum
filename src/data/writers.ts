export interface Writer {
    id: string;
    name: string;
    expertise: string;
    topics: string[];
    avatar: string;
    initials: string;
    color: string;
}

export const writers: Writer[] = [
    {
        id: "1",
        name: "Anna Sneha Mathew",
        expertise: "27 answers in Income",
        topics: ["Income", "Deaf People", "Employment"],
        avatar: "",
        initials: "AS",
        color: "#b92b27"
    },
    {
        id: "2",
        name: "Rajeswari Dharesh",
        expertise: "15 answers in Employment",
        topics: ["Employment", "Deafness"],
        avatar: "",
        initials: "RD",
        color: "#2e69ff"
    },
    {
        id: "3",
        name: "Marcus Thorne",
        expertise: "42 answers in Tech",
        topics: ["Technology", "AI", "Programming"],
        avatar: "",
        initials: "MT",
        color: "#2b7a3a"
    },
    {
        id: "4",
        name: "Seck Zhao",
        expertise: "31 answers in History",
        topics: ["History", "Education"],
        avatar: "",
        initials: "SZ",
        color: "#8b5cf6"
    },
    {
        id: "5",
        name: "Juhal Patel",
        expertise: "8 answers in Stage Management",
        topics: ["Theatre", "Management"],
        avatar: "",
        initials: "JP",
        color: "#f59e0b"
    },
    {
        id: "6",
        name: "Jehafin Dev",
        expertise: "19 answers in Lifestyle",
        topics: ["Lifestyle", "Health"],
        avatar: "",
        initials: "JD",
        color: "#ec4899"
    },
    {
        id: "7",
        name: "David Kegite",
        expertise: "52 answers in Business",
        topics: ["Business", "Marketing", "Income"],
        avatar: "",
        initials: "DK",
        color: "#10b981"
    },
    {
        id: "8",
        name: "Steve Noskowicz",
        expertise: "10 answers in Engineering",
        topics: ["Engineering", "Technology"],
        avatar: "",
        initials: "SN",
        color: "#6366f1"
    }
];
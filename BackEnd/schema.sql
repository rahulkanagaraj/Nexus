-- Automated Campus Research Project Lifecycle Management & Collaborative IP Filing Dashboard
-- Database Schema Script for MySQL

CREATE DATABASE IF NOT EXISTS campus_research_db;
USE campus_research_db;

-- 1. Users Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'IP_CELL', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract_text TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'READY_FOR_IP', 'IP_FILED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    current_milestone VARCHAR(100) DEFAULT 'Proposal Submitted',
    student_id BIGINT NOT NULL,
    faculty_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Proposals & Documents Table
CREATE TABLE IF NOT EXISTS proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Milestones History Table
CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. Faculty Reviews & Feedback Log
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    status_change VARCHAR(50) NOT NULL,
    feedback_text TEXT NOT NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. IP Filings & Patent Management Table
CREATE TABLE IF NOT EXISTS ip_filings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL UNIQUE,
    ip_type ENUM('PATENT', 'COPYRIGHT', 'TRADE_SECRET', 'INDUSTRIAL_DESIGN') NOT NULL DEFAULT 'PATENT',
    application_no VARCHAR(100),
    filing_status ENUM('DRAFTED', 'FILED', 'UNDER_EXAMINATION', 'GRANTED', 'REJECTED') NOT NULL DEFAULT 'DRAFTED',
    filing_date DATE,
    inventors TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Initial Seed Data for Testing & Demonstration
INSERT INTO users (id, full_name, email, password_hash, role, department) VALUES
(1, 'Aarav Sharma', 'aarav.student@campus.edu', 'student123', 'STUDENT', 'Computer Science & Engineering'),
(2, 'Ananya Patel', 'ananya.student@campus.edu', 'student123', 'STUDENT', 'AI & Data Science'),
(3, 'Dr. Rajesh Kumar', 'rajesh.faculty@campus.edu', 'faculty123', 'FACULTY', 'Computer Science & Engineering'),
(4, 'Dr. Sunita Rao', 'sunita.faculty@campus.edu', 'faculty123', 'FACULTY', 'AI & Data Science'),
(5, 'Administrator', 'admin@campus.edu', 'admin123', 'ADMIN', 'Research & Development')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO projects (id, title, abstract_text, department, domain, status, current_milestone, student_id, faculty_id) VALUES
(1, 'Autonomous Drone Swarm Navigation via Deep Reinforcement Learning', 'This project proposes a decentralized deep reinforcement learning algorithm for real-time trajectory optimization in multi-agent drone swarms under GPS-denied environments.', 'Computer Science & Engineering', 'Artificial Intelligence & Robotics', 'UNDER_REVIEW', 'Faculty Evaluation', 1, 3),
(2, 'Blockchain-Based Secure Medical Record Vault with Zero-Knowledge Proofs', 'A privacy-preserving electronic health records sharing platform leveraging ZK-SNARKs and IPFS for decentralized encryption and HIPAA compliance.', 'AI & Data Science', 'Cybersecurity & Cryptography', 'READY_FOR_IP', 'Ready for IP Filing', 2, 4),
(3, 'Low-Power IoT Edge Sensor Nodes for Agricultural Soil Health Monitoring', 'Designing an ultra-low energy LoRaWAN sensor node array capable of harvesting solar energy and predicting crop yield through machine learning.', 'Computer Science & Engineering', 'Internet of Things (IoT)', 'APPROVED', 'Proposal Approved', 1, 3)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO proposals (id, project_id, file_name, file_path, version) VALUES
(1, 1, 'Drone_Swarm_Navigation_Abstract.pdf', '/uploads/Drone_Swarm_Navigation_Abstract.pdf', 1),
(2, 2, 'Medical_Vault_ZKProofs_Proposal.pdf', '/uploads/Medical_Vault_ZKProofs_Proposal.pdf', 1),
(3, 3, 'IoT_Edge_Sensor_Nodes_Design.pdf', '/uploads/IoT_Edge_Sensor_Nodes_Design.pdf', 1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO milestones (id, project_id, milestone_name, status, notes) VALUES
(1, 1, 'Proposal Submitted', 'COMPLETED', 'Initial PDF proposal uploaded by student'),
(2, 1, 'Faculty Evaluation', 'IN_PROGRESS', 'Under review by Dr. Rajesh Kumar'),
(3, 2, 'Proposal Submitted', 'COMPLETED', 'Proposal uploaded'),
(4, 2, 'Faculty Evaluation', 'COMPLETED', 'Approved by Dr. Sunita Rao'),
(5, 2, 'Ready for IP Filing', 'IN_PROGRESS', 'Flagged as eligible for patent application')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO reviews (id, project_id, faculty_id, status_change, feedback_text) VALUES
(1, 2, 4, 'APPROVED', 'Excellent methodology on Zero-Knowledge Proof integration. The architecture is novel and suitable for patent filing under IP track.')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO ip_filings (id, project_id, ip_type, application_no, filing_status, filing_date, inventors) VALUES
(1, 2, 'PATENT', 'IN202641098234', 'DRAFTED', '2026-08-20', 'Ananya Patel, Dr. Sunita Rao')
ON DUPLICATE KEY UPDATE id=id;

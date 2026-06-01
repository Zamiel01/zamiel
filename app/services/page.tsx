"use client";

import {
  FaLaptopCode,
  FaMobileScreenButton,
  FaPalette,
  FaMagnifyingGlassChart,
  FaShieldHalved,
  FaMicrochip,
} from "react-icons/fa6";

const services = [
  {
    icon: FaLaptopCode,
    title: "Web Development",
    desc: "Building scalable web applications, robust frontends using React, Next.js, and Angular, combined with efficient backend systems running FastAPI and NestJS.",
  },
  {
    icon: FaMobileScreenButton,
    title: "Mobile Development",
    desc: "Designing and deploying cross-platform native smartphone applications leveraging Flutter to deliver pristine UI experiences and seamless performance.",
  },
  {
    icon: FaPalette,
    title: "Graphic Design",
    desc: "Crafting high-fidelity UI layout interfaces, unique prototypes, branding asset components, and structural layouts focused entirely on modern design principles.",
  },
  {
    icon: FaMagnifyingGlassChart,
    title: "SEO Optimization",
    desc: "Structuring clean application architecture to ensure high-velocity page loads, core web vital accuracy, and exceptional search platform accessibility markers.",
  },
  {
    icon: FaShieldHalved,
    title: "Penetration Testing",
    desc: "Identifying and exploiting security vulnerabilities in web applications, networks, and systems to strengthen defenses and protect sensitive data from malicious attacks.",
  },
  {
    icon: FaMicrochip,
    title: "IoT & Embedded Development",
    desc: "Building smart connected devices and embedded systems using microcontrollers, sensors, and real-time data processing to bridge hardware and software in innovative solutions.",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col px-6 lg:px-24 py-12">
      <div className="services-header">
        <h1>Services</h1>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.title}>
            <div className="service-icon-wrapper">
              <service.icon />
            </div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

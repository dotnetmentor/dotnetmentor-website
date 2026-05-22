#!/usr/bin/env python3
"""Generate agent-facing static files from _data/*.yml."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "_data"
SITE_URL = "https://dotnetmentor.se"
SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json"


def load(name: str) -> dict:
    with (DATA / f"{name}.yml").open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def render_contact_md(site: dict, team: list[dict]) -> str:
    rows = [
        "# Dotnet Mentor — Kontakt",
        "",
        f"> {site['tagline']}",
        "",
        "## Visit us",
        "",
        site["address"]["street"],
        f"{site['address']['postal_code']} {site['address']['city']}",
        "",
        "Between Järntorget and Masthuggsstorget.",
        "",
        "## General contact",
        "",
        f"- Email: {site['email']}",
        f"- Phone: {site['phone']}",
        "",
        "## Team",
        "",
        "| Name | Role | Email |",
        "|------|------|-------|",
    ]
    rows.extend(
        f"| {member['name']} | {member['role_en']} | {member['email']} |"
        for member in team
    )
    rows.extend(
        [
            "",
            "## Map",
            "",
            f"Office coordinates: {site['map_coordinates']} ({site['address']['city']}, {site['address']['country']})",
        ]
    )
    return "\n".join(rows)


def render_index_md(site: dict, services: dict) -> str:
    lines = [
        "# Dotnet Mentor",
        "",
        f"> {site['tagline']}",
        "",
        "**Erfarenhet och bredd inom IT-utveckling**",
        "",
        services["summary"],
        "",
        "## What we offer",
        "",
        "We provide software development consulting as part of your team, as mentors and trainers, or with full responsibility for projects and product development. We work with modern languages and technologies — JavaScript, Node.js, React, and .NET — and are strong in Serverless and Cloud.",
        "",
        "### Services",
        "",
    ]
    for offering in services["offerings"]:
        lines.append(f"- **{offering['name']}** — {offering['description']}")
    lines.extend(
        [
            "",
            "## Team",
            "",
            "Specialists with depth and breadth across .NET, JavaScript, React, Python, Serverless, and cloud platforms.",
            "",
            "## Contact",
            "",
            f"- Email: {site['email']}",
            f"- Phone: {site['phone']}",
            f"- Address: {site['address']['street']}, {site['address']['postal_code']} {site['address']['city']}",
            "",
            "## Links",
            "",
            "- [Services](/services)",
            "- [About](/about)",
            "- [Contact](/contact)",
            "- [Clients](/clients)",
            "- [Careers](/career)",
        ]
    )
    return "\n".join(lines)


def render_about_md(team: list[dict]) -> str:
    lines = [
        "# Dotnet Mentor — Om oss",
        "",
        "> Dotnet Mentor är ett team av mycket erfarna utvecklare som specialiserat sig på objektorienterad teknik och utveckling med stöd av agila metoder så som Kanban och Scrum.",
        "",
        "## Culture",
        "",
        "We strive to be among the best in our field through a balance of hard work, creative freedom, and strong cohesion. Internal competence days let us learn from each other and experiment.",
        "",
        "## Meetups",
        "",
        "We organize local meetups in our specialty areas to broaden and deepen knowledge in a relaxed setting.",
        "",
        "## Open Source",
        "",
        "We believe open source is the future. We contribute actively to projects including:",
        "",
        "- [Fluent Security](https://github.com/kristofferahl/FluentSecurity)",
        "- [Koshu](https://github.com/kristofferahl/Koshu/)",
        "- [server-base](https://github.com/JamesKyburz/server-base)",
        "- AWS Lambda tooling by James Kyburz",
        "- [Dotnet Mentor on GitHub](https://github.com/dotnetmentor)",
        "",
        "## Conferences",
        "",
        "We attend leading conferences in Sweden and Europe — as participants and speakers — as part of our continuous learning and community engagement.",
        "",
        "## Consultants",
        "",
    ]
    for member in team:
        if member.get("specialties"):
            label = member.get("homepage_label") or member["name"].split()[0]
            lines.append(f"- **{label}** — {', '.join(member['specialties'])}")
    lines.extend(["", "## Contact", "", "https://dotnetmentor.se/contact"])
    return "\n".join(lines)


def render_services_md(site: dict, services: dict) -> str:
    lines = [
        "# Dotnet Mentor — Tjänster",
        "",
        "> Mentorskap, konsulting & produktutveckling",
        "",
        "## Expertise",
        "",
        "Our core is .NET, but we offer consultants and mentors with the same high level of expertise in:",
        "",
    ]
    lines.extend(f"- {area}" for area in services["expertise_areas"])
    lines.extend(
        [
            "",
            "## Mentorship",
            "",
            "We know that strengthening your existing team is not always about adding more resources. We offer mentors and training to help you develop what you already have — through targeted interventions or long-term partnerships.",
            "",
            "## Consulting",
            "",
            "Dotnet Mentor are experts in IT architecture and software development. Our consultants specialize in .NET, interface development, and open source, helping customers evolve with new technologies and methods.",
            "",
            "## Training",
            "",
            "Project structure, data access, unit tests, CI/CD — we help teams get new projects off to a fast start. We also tailor training for your specific needs.",
            "",
            "## Product Development",
            "",
            "Beyond pure consulting, we offer product development services — creating, producing, and maintaining software products based on years of project experience.",
            "",
            "## Contact",
            "",
            f"{site['email']} | https://dotnetmentor.se/contact",
        ]
    )
    return "\n".join(lines)


def render_llms(site: dict, services: dict) -> str:
    address = site["address"]
    return "\n".join(
        [
            "# Dotnet Mentor",
            "",
            f"> {services['summary']}",
            "",
            services["intro"],
            "",
            "## Services",
            "",
            f"- [Services]({SITE_URL}/services): Consulting, mentorship, training, and product development",
            f"- [About]({SITE_URL}/about): Company culture, open source, and team background",
            f"- [Contact]({SITE_URL}/contact): Office location and team contact details",
            f"- [Clients]({SITE_URL}/clients): Customer references",
            f"- [Careers]({SITE_URL}/career): Job opportunities",
            "",
            "## Agent resources",
            "",
            f"- [Agent skills index]({SITE_URL}/.well-known/agent-skills/index.json): Machine-readable skill definitions",
            f"- [Homepage (markdown)]({SITE_URL}/content/index.md): Markdown version of the homepage",
            f"- [Services (markdown)]({SITE_URL}/content/services.md): Markdown version of services page",
            "",
            "## Contact",
            "",
            f"- Email: {site['email']}",
            f"- Phone: {site['phone']}",
            f"- Address: {address['street']}, {address['postal_code']} {address['city']}, {address['country']}",
        ]
    )


def render_skill_contact(site: dict, team: list[dict]) -> str:
    address = site["address"]
    lines = [
        "# Dotnet Mentor Contact",
        "",
        "How to reach Dotnet Mentor and our team in Göteborg.",
        "",
        "## Office",
        "",
        address["street"],
        f"{address['postal_code']} {address['city']}, {address['country']}",
        "",
        "Located between Järntorget and Masthuggsstorget.",
        "",
        "## General Contact",
        "",
        f"- Email: {site['email']}",
        f"- Phone: {site['phone']}",
        "",
        "## Team Members",
        "",
        "| Name | Role | Email | Specialties |",
        "|------|------|-------|-------------|",
    ]
    for member in team:
        specialties = ", ".join(member.get("specialties") or []) or "—"
        lines.append(
            f"| {member['name']} | {member['role_en']} | {member['email']} | {specialties} |"
        )
    lines.extend(["", "## Website", "", f"{SITE_URL}/contact"])
    return "\n".join(lines)


def render_skill_services(site: dict, services: dict) -> str:
    address = site["address"]
    lines = [
        "# Dotnet Mentor Services",
        "",
        "Consulting, mentorship, product development, and training for software teams.",
        "",
        "## Company",
        "",
        "Dotnet Mentor is a Swedish IT consultancy based in Göteborg. We offer experienced developers as consultants, mentors, trainers, or full product development partners.",
        "",
        "## Services",
        "",
    ]
    for offering in services["offerings"]:
        lines.extend([f"### {offering['name']}", offering["description"], ""])
    lines.extend(["## Technology Expertise", ""])
    lines.extend(f"- {tech}" for tech in services["technologies"])
    lines.extend(
        [
            "",
            "## Contact",
            "",
            f"- Email: {site['email']}",
            f"- Phone: {site['phone']}",
            f"- Address: {address['street']}, {address['postal_code']} {address['city']}, {address['country']}",
            f"- Website: {SITE_URL}/services",
        ]
    )
    return "\n".join(lines)


def render_skill_team(team: list[dict]) -> str:
    lines = [
        "# Dotnet Mentor Team",
        "",
        "Overview of Dotnet Mentor as a company and development team.",
        "",
        "## About",
        "",
        "Dotnet Mentor is a team of highly experienced developers specializing in object-oriented technology and agile methods such as Kanban and Scrum.",
        "",
        "## Culture",
        "",
        "We balance hard work, creative freedom, and strong team cohesion. Internal competence days, meetups, and conference participation keep us at the forefront of modern development.",
        "",
        "## Open Source",
        "",
        "We actively contribute to open source projects including Fluent Security, Koshu, server-base, AWS Lambda tooling, and more. See https://github.com/dotnetmentor.",
        "",
        "## Consultants",
        "",
        "Our consultants combine breadth with deep specialist knowledge:",
        "",
    ]
    for member in team:
        if member.get("specialties"):
            label = member.get("homepage_label") or member["name"].split()[0]
            lines.append(f"- **{label}** — {', '.join(member['specialties'])}")
    lines.extend(["", "## Website", "", "https://dotnetmentor.se/about"])
    return "\n".join(lines)


def digest(content: str) -> str:
    return f"sha256:{hashlib.sha256(content.encode('utf-8')).hexdigest()}"


def build_link_header(discovery: dict) -> str:
    parts = []
    for link in discovery["html_links"]:
        chunk = [f"<{link['href']}>", f"rel=\"{link['rel']}\""]
        if link.get("type"):
            chunk.append(f"type=\"{link['type']}\"")
        if link.get("title"):
            chunk.append(f"title=\"{link['title']}\"")
        parts.append("; ".join(chunk))
    return ", ".join(parts)


def main() -> None:
    site = load("site")
    team = load("team")
    services = load("services")
    discovery = load("agent_discovery")

    content_files = {
        ROOT / "content/contact.md": render_contact_md(site, team),
        ROOT / "content/index.md": render_index_md(site, services),
        ROOT / "content/about.md": render_about_md(team),
        ROOT / "content/services.md": render_services_md(site, services),
    }
    for path, body in content_files.items():
        write(path, body)

    write(ROOT / "llms.txt", render_llms(site, services))

    skill_specs = [
        ("contact", "dotnetmentor-contact", "Office location, general contact details, and team member information for Dotnet Mentor.", render_skill_contact(site, team)),
        ("services", "dotnetmentor-services", "Consulting, mentorship, product development, and training services offered by Dotnet Mentor.", render_skill_services(site, services)),
        ("team", "dotnetmentor-team", "Company culture, open source contributions, and consultant specialties at Dotnet Mentor.", render_skill_team(team)),
    ]

    index_skills = []
    for slug, name, description, body in skill_specs:
        skill_path = ROOT / ".well-known/agent-skills" / slug / "SKILL.md"
        write(skill_path, body)
        index_skills.append(
            {
                "name": name,
                "type": "skill-md",
                "description": description,
                "url": f"{SITE_URL}/.well-known/agent-skills/{slug}/SKILL.md",
                "digest": digest(body),
            }
        )

    write(
        ROOT / ".well-known/agent-skills/index.json",
        json.dumps({"$schema": SCHEMA, "skills": index_skills}, indent=2),
    )

    write(
        ROOT / "cloudflare/agent-discovery.json",
        json.dumps({"linkHeader": build_link_header(discovery)}, indent=2),
    )

    print("Generated agent artifacts from _data/*.yml")


if __name__ == "__main__":
    main()

// Every text on the page lives here: "en" is English, "de" is German. A text without a "de" key is the same
// in both languages (names of people, projects, tools and courses are never translated).
window.CONTENT = {
  email: "walid.ragoub@smail.th-koeln.de",
  github: { label: { en: "github.com/WaliGl0RY" }, url: "https://github.com/WaliGl0RY" },

  // A company's mark, shown as a small badge beside its name wherever the page names it. The name itself stays text.
  // voize-mark.png is the official logo (voize-logo.png) cropped to its symbol, with the white around it made
  // transparent for the dark page; no colour in it is changed.
  marks: [{ word: "voize", src: "assets/img/voize-mark.png", width: 189, height: 233 }],

  a11y: {
    skip: { en: "Skip to content", de: "Zum Inhalt springen" }
  },

  nav: {
    logo: { en: "WR." },
    home: { en: "WR. Walid Ragoub, back to top", de: "WR. Walid Ragoub, zurück nach oben" },
    cta: { en: "Email me", de: "Schreiben Sie mir" },
    // the language switch: "short" is what the button shows, "name" is what it is called for screen readers
    langLabel: { en: "Language", de: "Sprache" },
    langs: [
      { code: "de", short: "DE", name: "Deutsch" },
      { code: "en", short: "EN", name: "English" }
    ]
  },

  hero: {
    eyebrow: { en: "TECHNISCHE INFORMATIK · TH KÖLN" },
    first: { en: "Walid" },
    last: { en: "Ragoub" },
    bio: {
      en: "I'm Walid, 22 years old, in my fifth semester of Technische Informatik at TH Köln. I came to Germany as an international student with a new language and a whole new system to learn, and I decided to just start instead of overthinking how. That decision changed everything: today I love living here, I work as a student in technical support, and I'm building things I'm proud of. This is the path that got me here.",
      de: "Ich bin Walid, 22 Jahre alt, im fünften Semester Technische Informatik an der TH Köln. Ich kam als internationaler Student nach Deutschland und musste eine neue Sprache und ein ganz neues System lernen. Statt lange über das Wie nachzudenken, habe ich mich entschieden, einfach anzufangen. Diese Entscheidung hat alles verändert: Heute lebe ich sehr gern hier, arbeite als Werkstudent im technischen Support und baue Dinge, auf die ich stolz bin. Das ist der Weg, der mich hierher geführt hat."
    },
    // Phrases of the bio that are set in bold. They must appear in the bio exactly as written here.
    bioKeys: {
      en: ["22 years old", "fifth semester", "international student", "decided to just start"],
      de: ["22 Jahre alt", "fünften Semester", "internationaler Student", "entschieden, einfach anzufangen"]
    },
    hook: { en: "Give it a place. Clear the space.", de: "Allem seinen Platz geben. Raum schaffen." },
    cta1: { en: "See the work ↓", de: "Projekte ansehen ↓" },
    cta2: { en: "Email me →", de: "Schreiben Sie mir →" },
    scroll: { en: "SCROLL", de: "SCROLLEN" }
  },

  // The road's milestones, in travel order. A milestone without a "date" has none on purpose: no year is shown for it.
  // "tag" is the short caption that rides with the dot once that milestone is reached.
  // "via" is a second line, set apart: a link that opens the named project's deep dive.
  // "logo" is the institution's logo, shown beside the milestone once that file exists. thkoeln-logo-dark.png is
  // the official file (thkoeln-logo.png) with one change for the dark page: its black lettering is white.
  path: {
    title: { en: "The path", de: "Der Weg" },
    milestones: [
      { name: { en: "Baccalauréat Sciences Mathématiques A" }, note: { en: "Abitur equivalent", de: "entspricht dem Abitur" }, tag: { en: "Baccalauréat" } },
      { name: { en: "Studienkolleg" }, tag: { en: "Studienkolleg" } },
      { name: { en: "TH Köln" }, note: { en: "Technische Informatik" }, tag: { en: "TH Köln" }, logo: "assets/img/thkoeln-logo-dark.png" },
      { date: "01/2026", name: { en: "Cisco Networking Academy: Introduction to Networks" }, tag: { en: "01/2026" } },
      { date: "05/2026", name: { en: "Switching, Routing and Wireless Essentials" }, tag: { en: "05/2026" } },
      { date: "07/2026", name: { en: "Enterprise Networking, Security and Automation" }, tag: { en: "07/2026" } },
      {
        date: "10/2026",
        name: { en: "Working student, technical support at voize", de: "Werkstudent im technischen Support bei voize" },
        via: { project: "job-pipeline", text: { en: "Found through WayIn, my job pipeline →", de: "Gefunden über WayIn, meine Job-Pipeline →" } },
        tag: { en: "10/2026" }
      }
    ],
    // the label where the road ends, inside the scene below
    end: { en: "2026" }
  },

  // One sentence between the path and the scene below, set on two lines; read together they are the sentence.
  bridge: {
    line1: { en: "Getting here", de: "Der Weg hierher" },
    line2: { en: "wasn't tidy.", de: "war nicht aufgeräumt." }
  },

  // "line" comes once the first problems are in place and hands over to the title.
  how: {
    eyebrow: { en: "HOW I WORK", de: "WIE ICH ARBEITE" },
    line: { en: "This is how I work.", de: "So arbeite ich." },
    title1: { en: "Chaos arrives.", de: "Chaos kommt." },
    title2: { en: "Structure answers.", de: "Struktur antwortet." },
    problemsLabel: { en: "PROBLEMS", de: "PROBLEME" },
    ideasLabel: { en: "IDEAS", de: "IDEEN" },
    problems: [
      { en: "Eight exams", de: "Acht Klausuren" },
      { en: "No job", de: "Kein Job" },
      { en: "Pressure", de: "Druck" },
      { en: "Paperwork", de: "Papierkram" },
      { en: "Deadlines", de: "Fristen" },
      { en: "The language", de: "Die Sprache" },
      { en: "The new environment", de: "Die neue Umgebung" },
      { en: "wrong scores", de: "falsche Ergebnisse" },
      { en: "everyone asking about the standings", de: "alle fragen nach dem Tabellenstand" },
      { en: "one person organising it all", de: "eine Person organisiert alles" }
    ],
    ideas: [
      { en: "Plan every day.", de: "Jeden Tag planen." },
      { en: "Let routines search.", de: "Routinen suchen lassen." },
      { en: "Build it myself.", de: "Selbst bauen." }
    ],
    cardsLabel: { en: "Projects", de: "Projekte" },
    open: { en: "Deep dive ↓", de: "Im Detail ↓" }
  },

  // Per project: "name" is the name shown on the page; "id" and "repo" keep the repository's own name.
  // "lit" is one letter of the name that is lit like the name in the hero, in the project's "color".
  // "visual" sits at the top of the stage: the day grid ("plan") or a screen recording ("gif").
  // "story" opens behind the story button; a part marked "aside" is set apart quietly.
  // "repo", "branch" and "docs" say where the viewer loads each document from on GitHub when it opens.
  // "thumb" is the picture on the project's card in the scene above.
  work: {
    title: { en: "Where structure answered.", de: "Wo Struktur geantwortet hat." },
    sub: { en: "DEEP DIVE", de: "IM DETAIL" },
    index: { en: "Projects", de: "Projekte" },
    problem: { en: "PROBLEM" },
    built: { en: "BUILT", de: "GEBAUT" },
    out: { en: "CAME OUT", de: "KAM HERAUS" },
    readme: { en: "Read the full README", de: "Das ganze README lesen" },
    story: {
      open: { en: "The story", de: "Die Geschichte" },
      kicker: { en: "THE STORY", de: "DIE GESCHICHTE" },
      close: { en: "Close", de: "Schließen" },
      closeLabel: { en: "Close the story", de: "Geschichte schließen" }
    },
    media: {
      pause: { en: "Pause the recording", de: "Aufnahme anhalten" },
      play: { en: "Play the recording", de: "Aufnahme abspielen" }
    },
    projects: [
      {
        id: "disciplan",
        color: "#C0392B",
        name: { en: "DisciPlan" },
        lit: "D",
        meta: { en: "07–09/2026" },
        line: {
          en: "A study system for eight exams: a daily plan, study documents and trainers.",
          de: "Ein Lernsystem für acht Klausuren: ein Tagesplan, Lernunterlagen und Trainer."
        },
        tags: [
          { en: "Python (stdlib only)", de: "Python (nur Standardbibliothek)", skill: "python" },
          { en: "HTML/CSS/JS", skill: "web" },
          { en: "no server", de: "kein Server" }
        ],
        problem: { en: "Eight exams between 1 and 25 September 2026.", de: "Acht Klausuren zwischen dem 1. und 25. September 2026." },
        built: {
          en: "A daily plan, one study document per module, self-test trainers.",
          de: "Ein Tagesplan, eine Lernunterlage pro Modul, Trainer zum Selbsttesten."
        },
        out: { en: "The system I studied with from 4 August.", de: "Das System, mit dem ich ab dem 4. August gelernt habe." },
        thumb: "assets/img/disciplan-exam-banner.svg",
        visual: {
          type: "plan",
          days: 51,
          label: { en: "51 PLANNED DAYS", de: "51 GEPLANTE TAGE" },
          legend: { en: "one square = one day of the plan", de: "ein Quadrat = ein Tag des Plans" },
          line1: { en: "Motivation fades.", de: "Motivation vergeht." },
          line2: { en: "Discipline stays.", de: "Disziplin bleibt." },
          facts: { en: "51 days planned · 8 exams · 1–25 Sept", de: "51 Tage geplant · 8 Klausuren · 1.–25. Sept." }
        },
        story: [
          {
            en: "I had eight exams in one period, in a system that had always felt new to me. Until this challenge. I realised that trying to be ready never makes you ready, so I started. I needed all the material and its context in one place, and an easy way to switch between modules. So I built it: a daily plan, a study document per module and trainers to practise. I started building at the end of July and studied with it from 4 August until my last exam on 25 September.",
            de: "Ich hatte acht Klausuren in einer Prüfungsphase, in einem System, das sich für mich immer neu angefühlt hatte. Bis zu dieser Herausforderung. Mir wurde klar: Wer nur versucht, bereit zu sein, wird es nie. Also habe ich angefangen. Ich brauchte den gesamten Stoff und seinen Zusammenhang an einem Ort und einen einfachen Weg, zwischen den Modulen zu wechseln. Also habe ich es gebaut: einen Tagesplan, eine Lernunterlage pro Modul und Trainer zum Üben. Ende Juli habe ich mit dem Bauen begonnen und vom 4. August bis zu meiner letzten Klausur am 25. September damit gelernt."
          },
          {
            en: "This semester I'm developing it further during the lectures, into material made for the way I learn, with features that help me understand the topics and pass my exams well.",
            de: "In diesem Semester entwickle ich es während der Vorlesungen weiter: zu Material, das zu meiner Art zu lernen passt, mit Funktionen, die mir helfen, die Themen zu verstehen und meine Klausuren gut zu bestehen.",
            aside: true
          }
        ],
        repo: "WaliGl0RY/disciplan",
        branch: "main",
        docs: [
          { file: "docs/MY-EXAM-PERIOD.md", label: { en: "My exam period", de: "Meine Prüfungsphase" } },
          { file: "README.md", label: { en: "README" } }
        ],
        note: {
          en: "I built the plan together with an AI, and its time estimates were often off. In my SIG study document I found 14 AI errors by checking against the original solutions.",
          de: "Den Plan habe ich zusammen mit einer KI gebaut, und ihre Zeitschätzungen lagen oft daneben. In meiner SIG-Lernunterlage habe ich 14 KI-Fehler gefunden, indem ich sie mit den Originallösungen verglichen habe."
        }
      },
      {
        id: "job-pipeline",
        color: "#6D28D9",
        name: { en: "WayIn" },
        lit: "I",
        meta: { en: "07–10/2026" },
        line: {
          en: "A job search run by Claude routines: it finds postings, scores them against my CV and tracks replies.",
          de: "Eine Jobsuche mit Claude-Routinen: Sie findet Stellenanzeigen, bewertet sie anhand meines Lebenslaufs und behält die Antworten im Blick."
        },
        tags: [
          { en: "Python (stdlib)", de: "Python (Standardbibliothek)", skill: "python" },
          { en: "SQLite", skill: "sql" },
          { en: "MCP (Apify, Indeed)", skill: "mcp" },
          { en: "scheduled tasks", de: "Scheduled Tasks", skill: "mcp" }
        ],
        problem: {
          en: "Applying by hand to roles I would never have dared to apply to.",
          de: "Von Hand bewerben, auf Stellen, an die ich mich nie herangewagt hätte."
        },
        built: {
          en: "Claude routines find postings, score them, deliver the CV for each.",
          de: "Claude-Routinen finden Stellenanzeigen, bewerten sie und liefern für jede den Lebenslauf."
        },
        out: { en: "My working-student job at voize.", de: "Meine Werkstudentenstelle bei voize." },
        thumb: "assets/img/jobpipeline-banner.svg",
        visual: {
          type: "gif",
          src: "assets/img/jobpipeline-dashboard.gif",
          width: 960,
          height: 541,
          alt: {
            en: "Animated tour of the dashboard with fictional demo data: the overview with stat tiles, a search filter, a job detail panel with the invitation and mail history, copying the interview-prep prompt, and back to the overview",
            de: "Animierter Rundgang durch das Dashboard mit fiktiven Demodaten: die Übersicht mit Kennzahlen, ein Suchfilter, die Detailansicht einer Stelle mit Einladung und Mailverlauf, das Kopieren des Prompts zur Interviewvorbereitung und zurück zur Übersicht"
          }
        },
        story: [
          {
            en: "I needed a job as a student in a new country. Searching, reading postings and writing applications took hours next to my studies. So I let Claude routines do the searching: they find postings, score them against my CV and deliver the CV for the application. I applied myself every time. That's how I found my working student job at voize.",
            de: "Ich brauchte als Student in einem neuen Land einen Job. Suchen, Stellenanzeigen lesen und Bewerbungen schreiben kostete neben dem Studium Stunden. Also habe ich Claude-Routinen die Suche überlassen: Sie finden Stellenanzeigen, bewerten sie anhand meines Lebenslaufs und liefern den Lebenslauf für die Bewerbung. Beworben habe ich mich jedes Mal selbst. So habe ich meine Werkstudentenstelle bei voize gefunden."
          }
        ],
        repo: "WaliGl0RY/job-pipeline",
        branch: "main",
        docs: [{ file: "README.md", label: { en: "README" } }],
        note: {
          en: "No paid API. Weekly limits and cloud credits shape how I work.",
          de: "Keine kostenpflichtige API. Wochenlimits und Cloud-Guthaben bestimmen, wie ich arbeite."
        }
      },
      {
        id: "tournament-app",
        color: "#FF5E14",
        name: { en: "MatchDay" },
        lit: "y",
        meta: { en: "06/2026" },
        line: {
          en: "A tournament app for my friends. No score counts until the opponent confirms it.",
          de: "Eine Turnier-App für meine Freunde. Kein Ergebnis zählt, bevor der Gegner es bestätigt."
        },
        tags: [
          { en: "Python", skill: "python" },
          { en: "Flask", skill: "flask" },
          { en: "SQLite", skill: "sql" },
          { en: "plain JavaScript", de: "reines JavaScript", skill: "web" }
        ],
        problem: {
          en: "One person answering everyone about the standings, and friends joking with wrong scores.",
          de: "Eine Person beantwortet allen die Fragen zum Tabellenstand, und Freunde machen Scherze mit falschen Ergebnissen."
        },
        built: {
          en: "Standings for everyone. A score counts only when the opponent confirms it.",
          de: "Der Tabellenstand für alle. Ein Ergebnis zählt erst, wenn der Gegner es bestätigt."
        },
        out: { en: "Our FC 26 tournament ran on it.", de: "Unser FC-26-Turnier lief darüber." },
        thumb: "assets/img/tournament-banner.svg",
        visual: {
          type: "gif",
          src: "assets/img/tournament-demo.gif",
          width: 960,
          height: 600,
          alt: {
            en: "Demo: log in, league table, opponent validates a score, table updates, knockout bracket, champion celebration",
            de: "Demo: Anmeldung, Ligatabelle, der Gegner bestätigt ein Ergebnis, die Tabelle aktualisiert sich, K.-o.-Baum, Siegerfeier"
          }
        },
        story: [
          {
            en: "We play FC 26 tournaments in my friend group. One person organised everything and answered everyone about the standings. No platform fit, or it cost money. I was learning client-server in BVS2 at the time, so I built our own: one server, everyone on their phone or PC. Once it was live, my friends showed me what was missing. Some of it through feedback, some through jokes like 1000 goals. I adapted it while we played.",
            de: "In meinem Freundeskreis spielen wir FC-26-Turniere. Eine Person hat alles organisiert und allen die Fragen zum Tabellenstand beantwortet. Keine Plattform passte, oder sie kostete Geld. Ich lernte damals in BVS2 gerade Client-Server, also habe ich unsere eigene gebaut: ein Server, alle am Handy oder PC. Als sie lief, haben mir meine Freunde gezeigt, was fehlte. Manches durch Feedback, manches durch Scherze wie 1000 Tore. Ich habe sie angepasst, während wir gespielt haben."
          }
        ],
        repo: "WaliGl0RY/tournament-app",
        branch: "main",
        docs: [{ file: "README.md", label: { en: "README" } }],
        note: {
          en: "Not hardened on purpose: sessions and personal PINs only give each friend their own profile.",
          de: "Bewusst nicht gehärtet: Sitzungen und persönliche PINs geben jedem Freund nur sein eigenes Profil."
        }
      }
    ]
  },

  window: {
    close: { en: "Close window", de: "Fenster schließen" },
    minimize: { en: "Minimize window", de: "Fenster minimieren" },
    full: { en: "Toggle full screen", de: "Vollbild umschalten" },
    restore: { en: "Restore", de: "Wiederherstellen" },
    note: { en: "HONEST NOTE", de: "EHRLICH GESAGT" },
    docs: { en: "Documents", de: "Dokumente" },
    content: { en: "Project README", de: "README des Projekts" },
    loading: { en: "Loading from GitHub…", de: "Wird von GitHub geladen …" },
    error: { en: "This document could not be loaded from GitHub.", de: "Dieses Dokument konnte nicht von GitHub geladen werden." },
    github: { en: "View on GitHub", de: "Auf GitHub ansehen" },
    newTab: { en: "opens in a new tab", de: "öffnet in neuem Tab" },
    // a diagram written in a document (a "mermaid" block) is drawn in the window; the line is shown if it cannot be
    diagram: { en: "Diagram from the README", de: "Diagramm aus dem README" },
    diagramError: { en: "The diagram could not be drawn here. View it on GitHub.", de: "Das Diagramm konnte hier nicht gezeichnet werden. Sehen Sie es sich auf GitHub an." }
  },

  // "used": each skill and the projects it ran in (keys are project ids from work.projects), with one line on
  // what it did there. A tag in a deep dive points at a skill through its "skill" id.
  // "studies": learned in courses, in plain groups; deliberately not linked to any project. No skill levels anywhere.
  skills: {
    eyebrow: { en: "SKILLS", de: "KENNTNISSE" },
    title: { en: "What I used. Where it ran.", de: "Was ich genutzt habe. Wo es lief." },
    usedLabel: { en: "What I used", de: "Was ich genutzt habe" },
    ranLabel: { en: "Where it ran", de: "Wo es lief" },
    ranIn: { en: "ran in", de: "lief in" },
    notHere: { en: "Not used here.", de: "Hier nicht genutzt." },
    toDive: { en: "Deep dive ↑", de: "Im Detail ↑" },
    tagHint: { en: "show in skills", de: "bei den Kenntnissen anzeigen" },
    used: [
      {
        id: "python",
        name: { en: "Python" },
        where: {
          "disciplan": {
            en: "The build script that merges plan, documents and trainers into one offline page. Standard library only.",
            de: "Das Build-Skript, das Plan, Unterlagen und Trainer zu einer Offline-Seite zusammenführt. Nur Standardbibliothek."
          },
          "job-pipeline": {
            en: "The core modules around one SQLite file. Standard library only.",
            de: "Die Kernmodule rund um eine SQLite-Datei. Nur Standardbibliothek."
          },
          "tournament-app": { en: "The server side of the app.", de: "Die Serverseite der App." }
        }
      },
      {
        id: "flask",
        name: { en: "Flask" },
        where: {
          "tournament-app": {
            en: "One server that everyone uses at the same time, from phones and PCs.",
            de: "Ein Server, den alle gleichzeitig nutzen, vom Handy und vom PC."
          }
        }
      },
      {
        id: "sql",
        name: { en: "SQL and SQLite", de: "SQL und SQLite" },
        where: {
          "job-pipeline": {
            en: "One SQLite file holds every posting. Rows are never deleted, only their status changes.",
            de: "Eine SQLite-Datei enthält jede Stellenanzeige. Zeilen werden nie gelöscht, nur ihr Status ändert sich."
          },
          "tournament-app": {
            en: "The tables and the queries behind the standings and the scores.",
            de: "Die Tabellen und Abfragen hinter Tabellenstand und Ergebnissen."
          }
        }
      },
      {
        id: "web",
        name: { en: "HTML, CSS and JavaScript", de: "HTML, CSS und JavaScript" },
        where: {
          "disciplan": {
            en: "The plan, the study documents and the trainers are plain pages that open without a server.",
            de: "Plan, Lernunterlagen und Trainer sind einfache Seiten, die sich ohne Server öffnen lassen."
          },
          "tournament-app": {
            en: "Plain JavaScript pages, used from phones and PCs.",
            de: "Seiten in reinem JavaScript, genutzt vom Handy und vom PC."
          }
        }
      },
      {
        id: "mcp",
        name: { en: "MCP and scheduled tasks", de: "MCP und Scheduled Tasks" },
        where: {
          "job-pipeline": {
            en: "Claude routines reach job postings through MCP (Apify, Indeed). Semi-automatic: I review, and I apply myself.",
            de: "Claude-Routinen erreichen Stellenanzeigen über MCP (Apify, Indeed). Halbautomatisch: Ich prüfe, und ich bewerbe mich selbst."
          }
        }
      },
      {
        id: "git",
        name: { en: "Git and GitHub", de: "Git und GitHub" },
        where: {
          "disciplan": {
            en: "The repository, with three invented demo modules to try.",
            de: "Das Repository, mit drei erfundenen Demo-Modulen zum Ausprobieren."
          },
          "job-pipeline": {
            en: "The repository, with the routines and the fixes written down.",
            de: "Das Repository, mit den Routinen und den festgehaltenen Korrekturen."
          },
          "tournament-app": {
            en: "The repository. The app grew commit by commit.",
            de: "Das Repository. Die App ist Commit für Commit gewachsen."
          }
        }
      },
      {
        id: "railway",
        name: { en: "Railway" },
        where: {
          "tournament-app": { en: "Where the app was deployed.", de: "Dort wurde die App bereitgestellt." }
        }
      },
      {
        id: "claude",
        name: { en: "Claude as coding assistant", de: "Claude als Coding-Assistent" },
        where: {
          "disciplan": {
            en: "Wrote the code and the study documents I asked for. I tested every part against my own exams.",
            de: "Hat den Code und die Lernunterlagen geschrieben, um die ich gebeten habe. Ich habe jeden Teil an meinen eigenen Klausuren geprüft."
          },
          "job-pipeline": {
            en: "Does the searching and the scoring as routines. I apply myself every time.",
            de: "Übernimmt das Suchen und das Bewerten als Routinen. Ich bewerbe mich jedes Mal selbst."
          },
          "tournament-app": {
            en: "Turned the idea into a working app fast. I decided what it needed.",
            de: "Hat aus der Idee schnell eine funktionierende App gemacht. Ich habe entschieden, was sie braucht."
          }
        }
      }
    ],
    studiesLabel: { en: "From my studies", de: "Aus meinem Studium" },
    studies: [
      {
        label: { en: "Programming languages", de: "Programmiersprachen" },
        items: [
          { en: "Java" },
          { en: "C and C++", de: "C und C++" }
        ]
      },
      {
        label: { en: "Systems", de: "Systeme" },
        items: [
          { en: "Unix interface", de: "Unix-Schnittstelle" },
          { en: "Linux" },
          { en: "Docker lab in BVS2", de: "Docker-Praktikum in BVS2" }
        ]
      },
      {
        label: { en: "Networking and services", de: "Netzwerke und Dienste" },
        items: [
          { en: "REST, SOAP, RPC, RMI and sockets", de: "REST, SOAP, RPC, RMI und Sockets" },
          { en: "Cisco Networking Academy courses 1–3", de: "Cisco Networking Academy, Kurse 1–3" }
        ]
      },
      {
        label: { en: "Methods and courses", de: "Methoden und Kurse" },
        items: [
          { en: "Scrum from the SWP project", de: "Scrum aus dem SWP-Projekt" },
          { en: "Microsoft Entra ID module", de: "Modul zu Microsoft Entra ID" }
        ]
      }
    ]
  },

  // "beats" are the four lines that come and go while the clip plays; the rest appears on the smile.
  contact: {
    eyebrow: { en: "CONTACT", de: "KONTAKT" },
    beats: [
      {
        en: "I'm interested in networking and IT security, and I'm fascinated by the development of AI.",
        de: "Ich interessiere mich für Netzwerke und IT-Sicherheit, und die Entwicklung der KI fasziniert mich."
      },
      {
        en: "I try to stay up to date with the newest technologies.",
        de: "Ich versuche, bei den neuesten Technologien auf dem Laufenden zu bleiben."
      },
      {
        en: "I believe that knowing how to use AI and build your own setup is a skill everyone will need in the future.",
        de: "Ich glaube, dass der Umgang mit KI und der Aufbau eines eigenen Setups eine Fähigkeit ist, die in Zukunft jeder brauchen wird."
      },
      {
        en: "My goal is to master these interests and make them work together.",
        de: "Mein Ziel ist es, diese Gebiete zu beherrschen und miteinander zu verbinden."
      }
    ],
    title1: { en: "Thanks for reading.", de: "Danke fürs Lesen." },
    title2: { en: "Let's talk." }, // stays in English in the German version too (his choice)
    sub: {
      en: "I'd be glad to work on something like this with you: as a tutor, a student assistant or in a project.",
      de: "Ich würde mich freuen, mit Ihnen an so etwas zu arbeiten: als Tutor, als studentische Hilfskraft oder in einem Projekt."
    },
    copy: { en: "Copy", de: "Kopieren" },
    copyLabel: { en: "Copy email address", de: "E-Mail-Adresse kopieren" },
    copied: { en: "Copied", de: "Kopiert" },
    cta: { en: "Email me →", de: "Schreiben Sie mir →" },
    cv: { en: "CV", de: "Lebenslauf" },
    cvFile: "assets/cv.pdf", // the CV button stays hidden until this file exists
    // The languages he works in. "text" is the whole sentence, which is what the page contains and what is read out;
    // "names" are the parts of it shown as the row of languages (each must appear in the sentence, in this order).
    languages: {
      label: { en: "Languages", de: "Sprachen" },
      text: {
        en: "I work in German, French, English, Arabic and Moroccan Darija.",
        de: "Ich arbeite auf Deutsch, Französisch, Englisch, Arabisch und Marokkanisch-Arabisch (Darija)."
      },
      names: {
        en: ["German", "French", "English", "Arabic", "Moroccan Darija"],
        de: ["Deutsch", "Französisch", "Englisch", "Arabisch", "Marokkanisch-Arabisch (Darija)"]
      }
    }
  },

  footer: { en: "Walid Ragoub · 2026" }
};

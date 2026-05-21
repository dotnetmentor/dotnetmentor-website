(function () {
  'use strict';

  if (!('modelContext' in navigator)) {
    return;
  }

  var controller = new AbortController();
  var signal = controller.signal;

  window.addEventListener('pagehide', function () {
    controller.abort();
  });

  var consultants = [
    { id: 'mikael', name: 'Mikael Egnér', role: 'CEO', email: 'mikael.egner@dotnetmentor.se', specialties: ['.NET', 'Databases', 'Architecture'] },
    { id: 'william', name: 'William Holmberg', role: 'Consulting Manager & Developer', email: 'william.holmberg@dotnetmentor.se', specialties: ['React', 'JavaScript', 'Node', '.NET', 'Serverless'] },
    { id: 'fredrik', name: 'Fredrik Hansson', role: 'Developer', email: 'fredrik.hansson@dotnetmentor.se', specialties: ['JavaScript', '.NET', 'Ruby', 'Scala', 'Serverless'] },
    { id: 'andreas', name: 'Andreas Larsson', role: 'Developer', email: 'andreas.larsson@dotnetmentor.se', specialties: ['UX', 'React', 'JavaScript', '.NET'] },
    { id: 'victor', name: 'Victor Ronnerstedt', role: 'Developer', email: 'victor.ronnerstedt@dotnetmentor.se', specialties: ['React', 'JavaScript', '.NET', 'Serverless'] },
    { id: 'tim', name: 'Tim Larsson', role: 'Developer', email: 'tim.larsson@dotnetmentor.se', specialties: ['React', '.NET', 'Python'] },
    { id: 'agnes', name: 'Agnes Frost', role: 'Developer', email: 'agnes.frost@dotnetmentor.se', specialties: ['React', 'JavaScript', 'Python'] },
    { id: 'axel', name: 'Axel Rosendahl', role: 'Developer', email: 'axel.rosendahl@dotnetmentor.se', specialties: [] },
    { id: 'oliver', name: 'Oliver Nygren', role: 'Developer', email: 'oliver.nygren@dotnetmentor.se', specialties: [] },
    { id: 'aymen', name: 'Aymen Toukabri', role: 'Developer', email: 'aymen.toukabri@dotnetmentor.se', specialties: [] }
  ];

  var services = [
    { name: 'Consulting', description: 'IT architecture and software development with .NET, front-end, and open source expertise.' },
    { name: 'Mentorship', description: 'Targeted or long-term mentorship to strengthen existing development teams.' },
    { name: 'Training', description: 'Custom training on project structure, testing, CI/CD, and team onboarding.' },
    { name: 'Product Development', description: 'End-to-end product creation, maintenance, and evolution.' }
  ];

  var techStack = [
    '.NET', 'JavaScript', 'Node.js', 'React', 'Ruby', 'Ruby on Rails',
    'Python', 'AWS', 'Serverless', 'Kubernetes', 'Infrastructure as Code', 'CI/CD'
  ];

  var pages = [
    { path: '/', title: 'Home' },
    { path: '/services', title: 'Services' },
    { path: '/about', title: 'About' },
    { path: '/contact', title: 'Contact' },
    { path: '/clients', title: 'Clients' },
    { path: '/career', title: 'Careers' }
  ];

  navigator.modelContext.registerTool({
    name: 'get-site-info',
    title: 'Get site info',
    description: 'Returns general information about Dotnet Mentor, a Swedish IT consultancy in Göteborg.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async function () {
      return {
        name: 'Dotnet Mentor',
        description: 'Swedish IT consultancy offering consulting, mentorship, training, and product development.',
        email: 'info@dotnetmentor.se',
        phone: '+46 707 493 603',
        address: 'Första långgatan 22, 413 28 Göteborg, Sweden',
        website: 'https://dotnetmentor.se'
      };
    }
  }, { signal: signal });

  navigator.modelContext.registerTool({
    name: 'list-services',
    title: 'List services',
    description: 'Lists the consulting services offered by Dotnet Mentor.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async function () {
      return { services: services };
    }
  }, { signal: signal });

  navigator.modelContext.registerTool({
    name: 'list-tech-stack',
    title: 'List tech stack',
    description: 'Lists the technologies and platforms Dotnet Mentor specializes in.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async function () {
      return { technologies: techStack };
    }
  }, { signal: signal });

  navigator.modelContext.registerTool({
    name: 'list-consultants',
    title: 'List consultants',
    description: 'Lists Dotnet Mentor consultants with their roles, emails, and specialties.',
    inputSchema: {
      type: 'object',
      properties: {
        specialty: {
          type: 'string',
          description: 'Optional filter by technology or specialty (case-insensitive substring match).'
        }
      }
    },
    annotations: { readOnlyHint: true },
    execute: async function (input) {
      var filter = input && input.specialty ? input.specialty.toLowerCase() : null;
      var result = consultants;

      if (filter) {
        result = consultants.filter(function (c) {
          return c.specialties.some(function (s) {
            return s.toLowerCase().indexOf(filter) !== -1;
          }) || c.name.toLowerCase().indexOf(filter) !== -1;
        });
      }

      return { consultants: result };
    }
  }, { signal: signal });

  navigator.modelContext.registerTool({
    name: 'get-contact-info',
    title: 'Get contact info',
    description: 'Returns Dotnet Mentor office address, general email, and phone number.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async function () {
      return {
        email: 'info@dotnetmentor.se',
        phone: '+46 701 48 16 29',
        address: {
          street: 'Första långgatan 22',
          postalCode: '413 28',
          city: 'Göteborg',
          country: 'Sweden'
        }
      };
    }
  }, { signal: signal });

  navigator.modelContext.registerTool({
    name: 'navigate-to-page',
    title: 'Navigate to page',
    description: 'Navigates the browser to a page on the Dotnet Mentor website.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Site path such as /services, /about, /contact, /clients, or /career.',
          enum: ['/', '/services', '/about', '/contact', '/clients', '/career']
        }
      },
      required: ['path']
    },
    execute: async function (input, client) {
      var path = input.path;
      var page = pages.find(function (p) { return p.path === path; });

      if (!page) {
        throw new Error('Unknown path: ' + path);
      }

      await client.requestUserInteraction(function () {
        window.location.href = path;
      });

      return { navigatedTo: path, title: page.title };
    }
  }, { signal: signal });
})();

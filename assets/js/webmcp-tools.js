(function () {
  'use strict';

  if (!('modelContext' in navigator)) {
    return;
  }

  var dataElement = document.getElementById('dotnetmentor-agent-data');
  if (!dataElement) {
    return;
  }

  var data;
  try {
    data = JSON.parse(dataElement.textContent);
  } catch (error) {
    return;
  }

  var controller = new AbortController();
  var signal = controller.signal;

  window.addEventListener('pagehide', function () {
    controller.abort();
  });

  var site = data.site;
  var services = data.services;
  var techStack = data.technologies;
  var consultants = data.team;
  var pages = data.pages;

  navigator.modelContext.registerTool({
    name: 'get-site-info',
    title: 'Get site info',
    description: 'Returns general information about Dotnet Mentor, a Swedish IT consultancy in Göteborg.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async function () {
      return {
        name: site.name,
        description: 'Swedish IT consultancy offering consulting, mentorship, training, and product development.',
        email: site.email,
        phone: site.phone,
        address: site.address.street + ', ' + site.address.postal_code + ' ' + site.address.city + ', ' + site.address.country,
        website: site.website
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
        email: site.email,
        phone: site.phone,
        address: {
          street: site.address.street,
          postalCode: site.address.postal_code,
          city: site.address.city,
          country: site.address.country
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

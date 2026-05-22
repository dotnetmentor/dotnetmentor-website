#!/usr/bin/env ruby
# frozen_string_literal: true

root = File.expand_path('..', __dir__)
system('python3', File.join(root, 'scripts/generate-agent-artifacts.py'), chdir: root) || exit(1)
puts 'Agent artifacts regenerated from _data/*.yml.'

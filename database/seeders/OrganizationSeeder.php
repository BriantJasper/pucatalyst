<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Organization;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bureaucracy = [
            [
                'name' => 'Student Affairs',
                'category' => 'Bureaucracy',
                'description' => 'The highest level of student organization bureaucracy.',
            ],
            [
                'name' => 'President University Student Council (PUSC)',
                'category' => 'Bureaucracy',
                'description' => 'Legislative body of the student government.',
            ],
            [
                'name' => 'President University Student Board (PUSB)',
                'category' => 'Bureaucracy',
                'description' => 'Executive body of the student government.',
            ],
            [
                'name' => 'President University Faculty Association (PUFA)',
                'category' => 'Bureaucracy',
                'description' => 'Association representing students at the faculty level.',
            ],
            [
                'name' => 'President University Major Association (PUMA)',
                'category' => 'Bureaucracy',
                'description' => 'Association representing students at the major level.',
            ],
        ];

        $societies = [
            'Zahirul Ma\'ala',
            'CooL',
            'Pucatso',
            'KMBA',
            'KMHD',
            'AIESEC',
            'PUDS',
            'NABA',
            'PRESCOM',
            'PURTC',
            'PUDC',
            'K-Club'
        ];

        $arts = [
            'PRIME',
            'Shutter',
            'PUNICO',
            'Mr&Ms President University',
            'D\'Chorpus',
            'Archipulago'
        ];

        $sports = [
            'PUBC',
            'PUBA',
            'Diverventure',
            'PUKC',
            'PUFC',
            'Golferation',
            'PUTS',
            'PUTC'
        ];

        $regions = [
            [
                'name' => 'HANAPU',
                'description' => 'Himpunan Anak Nanggroe Aceh PU',
            ],
            [
                'name' => 'AJAPU',
                'description' => 'Arek Jawa Timur PU',
            ],
            [
                'name' => 'COMPRES',
                'description' => 'Community Papua PresU',
            ],
            [
                'name' => 'SENJA',
                'description' => 'Student of Central Java',
            ],
        ];

        $others = [
            [
                'name' => 'PUFELINE',
                'description' => 'Cat Lover Community',
                'category' => 'Community'
            ],
            [
                'name' => 'Adventure Motor Club',
                'description' => 'Motorcycle enthusiasts community',
                'category' => 'Community'
            ]
        ];

        // Seed Bureaucracy
        foreach ($bureaucracy as $org) {
            Organization::updateOrCreate(
                ['name' => $org['name']],
                [
                    'category' => $org['category'],
                    'description' => $org['description'],
                    'is_active' => true,
                ]
            );
        }

        // Seed Societies
        foreach ($societies as $name) {
            Organization::updateOrCreate(
                ['name' => $name],
                [
                    'category' => 'Society',
                    'description' => "$name is a student society at President University.",
                    'is_active' => true,
                ]
            );
        }

        // Seed Arts
        foreach ($arts as $name) {
            Organization::updateOrCreate(
                ['name' => $name],
                [
                    'category' => 'Art',
                    'description' => "$name is an art-focused student organization.",
                    'is_active' => true,
                ]
            );
        }

        // Seed Sports
        foreach ($sports as $name) {
            Organization::updateOrCreate(
                ['name' => $name],
                [
                    'category' => 'Sport',
                    'description' => "$name is a sports club at President University.",
                    'is_active' => true,
                ]
            );
        }

        // Seed Regions
        foreach ($regions as $org) {
            Organization::updateOrCreate(
                ['name' => $org['name']],
                [
                    'category' => 'Region CNC',
                    'description' => $org['description'],
                    'is_active' => true,
                ]
            );
        }

        // Seed Others
        foreach ($others as $org) {
            Organization::updateOrCreate(
                ['name' => $org['name']],
                [
                    'category' => $org['category'],
                    'description' => $org['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}

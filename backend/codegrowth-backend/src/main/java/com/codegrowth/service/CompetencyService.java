package com.codegrowth.service;

import com.codegrowth.entity.Competency;
import com.codegrowth.entity.CompetencyLevel;
import com.codegrowth.repository.CompetencyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompetencyService {

    private final CompetencyRepository competencyRepository;

    public CompetencyService(
            CompetencyRepository competencyRepository) {

        this.competencyRepository = competencyRepository;
    }

    public Competency createCompetency(
            Competency competency) {

        if (competencyRepository.existsByName(
                competency.getName())) {

            throw new IllegalArgumentException(
                    "A competency with this name already exists"
            );
        }

        return competencyRepository.save(competency);
    }

    public List<Competency> getAllCompetencies() {

        return competencyRepository.findAll();
    }

    public List<Competency> getActiveCompetencies() {

        return competencyRepository.findByActiveTrue();
    }

    public Optional<Competency> getCompetencyById(
            Long id) {

        return competencyRepository.findById(id);
    }

    public Optional<Competency> getCompetencyByName(
            String name) {

        return competencyRepository.findByName(name);
    }

    public List<Competency> getCompetenciesByLevel(
            CompetencyLevel level) {

        return competencyRepository.findByLevel(level);
    }

    public Competency updateCompetency(
            Long id,
            Competency updatedCompetency) {

        Competency existingCompetency =
                competencyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Competency not found with id: "
                                                + id
                                )
                        );

        if (!existingCompetency.getName()
                .equals(updatedCompetency.getName())
                && competencyRepository.existsByName(
                updatedCompetency.getName())) {

            throw new IllegalArgumentException(
                    "A competency with this name already exists"
            );
        }

        existingCompetency.setName(
                updatedCompetency.getName()
        );

        existingCompetency.setDescription(
                updatedCompetency.getDescription()
        );

        existingCompetency.setLevel(
                updatedCompetency.getLevel()
        );

        existingCompetency.setActive(
                updatedCompetency.getActive()
        );

        return competencyRepository.save(
                existingCompetency
        );
    }

    public Competency updateCompetencyLevel(
            Long id,
            CompetencyLevel level) {

        Competency competency =
                competencyRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Competency not found with id: "
                                                + id
                                )
                        );

        competency.setLevel(level);

        return competencyRepository.save(competency);
    }

    public void deleteCompetency(Long id) {

        if (!competencyRepository.existsById(id)) {

            throw new IllegalArgumentException(
                    "Competency not found with id: " + id
            );
        }

        competencyRepository.deleteById(id);
    }
}

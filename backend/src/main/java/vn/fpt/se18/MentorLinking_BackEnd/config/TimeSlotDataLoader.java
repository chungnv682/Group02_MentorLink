//package vn.fpt.se18.MentorLinking_BackEnd.config;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;
//import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
//import vn.fpt.se18.MentorLinking_BackEnd.repository.TimeSlotRepository;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class TimeSlotDataLoader implements CommandLineRunner {
//
//    private final TimeSlotRepository timeSlotRepository;
//
//    @Override
//    public void run(String... args) throws Exception {
//        // Only initialize if no time slots exist
//        if (timeSlotRepository.count() == 0) {
//            log.info("Initializing time slots data...");
//
//            List<TimeSlot> timeSlots = new ArrayList<>();
//
//            // Create time slots from 8:00 to 22:00 (8 AM to 10 PM)
//            for (int hour = 8; hour <= 21; hour++) {
//                TimeSlot timeSlot = TimeSlot.builder()
//                        .code("SLOT_" + hour + "_" + (hour + 1))
//                        .timeStart(hour)
//                        .timeEnd(hour + 1)
//                        .build();
//                timeSlots.add(timeSlot);
//            }
//
//            timeSlotRepository.saveAll(timeSlots);
//            log.info("Initialized {} time slots successfully", timeSlots.size());
//        } else {
//            log.info("Time slots already exist, skipping initialization");
//        }
//    }
//}
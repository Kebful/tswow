# Catch2 (testing library)
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG v3.0.1
)
FetchContent_MakeAvailable(Catch2)

# unit tests
FILE(GLOB tests-sources ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)
add_executable(tests ${tests-sources})
target_link_libraries(tests PRIVATE Catch2::Catch2WithMain CustomPackets)
target_include_directories(tests PUBLIC
    ${CMAKE_SOURCE_DIR}/lua-5.1/src
    ${CMAKE_SOURCE_DIR}/CustomPackets
)

# Packet ownership and fragment round trips (ported from Duskhaven). Plain asserts with its own main, so it is a
# separate executable from the Catch2 tests above.
add_executable(CustomPacketOwnershipTests standalone/CustomPacketOwnershipTests.cpp)
target_link_libraries(CustomPacketOwnershipTests PRIVATE CustomPackets)
target_include_directories(CustomPacketOwnershipTests PRIVATE ${CMAKE_SOURCE_DIR}/CustomPackets)
enable_testing()
add_test(NAME custom-packet-ownership COMMAND CustomPacketOwnershipTests)

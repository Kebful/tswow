cmake_minimum_required(VERSION 3.22)
project(mpqbuilder)
set( Boost_USE_STATIC_LIBS ON )
FIND_PACKAGE( Boost 1.60 COMPONENTS filesystem REQUIRED )
add_executable(mpqbuilder mpqbuilder.cpp)
add_executable(luaxmlreader luaxmlreader.cpp)

include (FetchContent)
FetchContent_Declare(
  storm
  GIT_REPOSITORY https://github.com/ladislav-zezula/StormLib.git
  GIT_TAG 60c2dd0fa16d3506722e25fee9b6fa4082b0c1e5
)
# The pinned StormLib requests CMake 2.8 policies, unsupported by CMake 4.
# Keep its compatibility floor local rather than changing the caller's cache.
function(tswow_make_storm_available)
  if(CMAKE_VERSION VERSION_GREATER_EQUAL "4.0" AND
      (NOT DEFINED CMAKE_POLICY_VERSION_MINIMUM OR
       CMAKE_POLICY_VERSION_MINIMUM VERSION_LESS "3.10"))
    set(CMAKE_POLICY_VERSION_MINIMUM 3.10)
  endif()
  FetchContent_MakeAvailable(storm)
  # Preserve EXCLUDE_FROM_ALL with our minimum supported CMake 3.22, before
  # FetchContent_Declare gained its EXCLUDE_FROM_ALL option in CMake 3.28.
  set_property(DIRECTORY "${storm_SOURCE_DIR}" PROPERTY EXCLUDE_FROM_ALL TRUE)
endfunction()
tswow_make_storm_available()
set (storm_warning_disable_flags "")
TARGET_LINK_LIBRARIES(mpqbuilder
  Boost::filesystem
  storm
)
TARGET_LINK_LIBRARIES(luaxmlreader
  Boost::filesystem
  storm
)

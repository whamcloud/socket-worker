%define base_name socket-worker

Name:       iml-%{base_name}
Version:    4.0.2
Release:    1%{?dist}
Summary:    Socket.io client that runs in a WebWorker.
License:    MIT
Group:      System Environment/Libraries
URL:        https://github.com/whamcloud/%{base_name}
Source0:    %{name}-%{version}.tgz

BuildRequires: nodejs-packaging
BuildArch: noarch

%description
Socket.io client that runs in a WebWorker. Handles data parsing / munging.

%prep
%setup -q -n package

%build
#nothing to do

%install
mkdir -p %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}/targetdir
cp -al targetdir/. %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}/targetdir
cp -p package.json %{buildroot}%{nodejs_sitelib}/@iml/%{base_name}

%clean
rm -rf %{buildroot}

%files
%{nodejs_sitelib}

%changelog
* Mon Jan 14 2019 Will Johnson <wjohnson@whamcloud.com> - 4.0.2-1
- Install deps before running postversion

* Mon Jan 14 2019 Will Johnson <wjohnson@whamcloud.com> - 4.0.1-1
- Build using Docker copr image

* Tue Jun 19 2018 Joe Grund <jgrund@whamcloud.com> - 4.0.0-1
- Build using FAKE
- Initial standalone RPM package
